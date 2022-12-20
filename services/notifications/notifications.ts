import push from './notification_settings';
import { readDB } from '../db/postgres/knex_fastify_plugin';
import logger from '../../logger';
import { PLATFORM } from '../../utils/platform';
import { Device } from '../../models/device';
import PushNotifications from 'node-pushnotifications';

function generateNotificationData(platform: PLATFORM = 'iOS'): PushNotifications.Data {
  const data = {
    title: '',
    topic: '',
    body: '',
    retries: 5,
    encoding: '',
    badge: 0,
    sound: platform === 'iOS' ? 'ping.aiff' : '',
    android_channel_id: '',
    notificationCount: 0,
    silent: false,
    truncateAtWordEnd: true,
    mutableContent: 1,
    pushType: undefined,
    expiry: Math.floor(Date.now() / 1000) + 28 * 86400,
    timeToLive: 28 * 86400,
  };
  return data;
}
/**
 * Use the push notification module to push notifications to a list of users
 * @async
 * @param userIds The ids of the users
 * @param notificationData The notification data
 * @returns Resolves the result of the notification or an error
 */
async function sendPushNotification(
  userIds: number[],
  notificationData: PushNotifications.Data,
): Promise<PushNotifications.Result[] | Error> {
  try {
    const devices = await readDB('devices')
      .select('token')
      .join('users', 'devices.user_id', '=', 'users.id')
      .whereIn('users.id', userIds);
    if (devices.length < 1) {
      // Check that device tokens isn't empty
      return new Error('No devices');
    }
    const tokens: string[] = devices.map((t: Device) => String(t.token));
    const result = await push.send(tokens, notificationData);
    return result;
  } catch (error) {
    logger(null).error(error as Error, 'An error occured when sending notification');
    return error as Error;
  }
}

/**
 * Create a push notification when a user has rated a song
 * @param messageId The id of the message being rated
 * @returns Result of the notification
 */
export const sendNotificationOnCreatedRating = async (
  messageId: number,
): Promise<PushNotifications.Result[] | Error> => {
  const senderUser = await readDB('users')
    .select(['users.id', 'messages.id as message_id'])
    .innerJoin('messages', 'users.id', '=', 'messages.sender_id')
    .where('messages.id', '=', messageId)
    .first();
  const recipientUser = await readDB('users')
    .select(['users.id', 'users.username', 'users.display_name', 'messages.id as message_id'])
    .innerJoin('messages', 'users.id', '=', 'messages.recipient_id')
    .where('messages.id', '=', messageId)
    .first();
  const notificationData = generateNotificationData();
  notificationData.body = `${
    recipientUser.display_name || recipientUser.username
  } just rated a song you sent!`;
  notificationData.topic = 'org.reactjs.native.example.mutualsapp';
  notificationData.title = 'New rating 👀';
  notificationData.custom = {
    type: 'sent_message',
    message_id: recipientUser.message_id,
    link: `kiwi://messages/sent/${recipientUser.message_id}`,
  };
  notificationData.mutableContent = 1;
  return sendPushNotification([senderUser.id], notificationData);
};

const sendPushNotificationOnReceivedFriendRequest = async (
  requestedUserId: number,
  requesterUserId: number,
): Promise<PushNotifications.Result[] | Error> => {
  const requestedUser = await readDB('users').where({ id: requestedUserId }).first();
  const requesterUser = await readDB('users').where({ id: requesterUserId }).first();
  if (!requestedUser || !requesterUser) {
    return new Error('No users found');
  }
  const notificationData = generateNotificationData();
  notificationData.body = `${requesterUser.display_name || requesterUser.username} added you!`;
  notificationData.topic = 'org.reactjs.native.example.mutualsapp';
  notificationData.title = 'More songs coming your way!';
  notificationData.sound = 'activity_notification_sound.caf';
  notificationData.mutableContent = 1;
  notificationData.custom = {
    type: 'user',
    user_id: requesterUser.id,
    link: `kiwi://v1/users/${requesterUser.id}`,
  };
  return sendPushNotification([requestedUserId], notificationData);
};

/**
 *
 * @param messageId The primary key id of the message
 * @param senderUserId The primary key id of the sender
 * @param recipientUserId The primary key id of the recipient user
 * @returns The notification result
 */
export const sendNotificationOnReceivedSong = async (
  messageId: number,
  senderUserId: number,
  recipientUserId: number,
): Promise<PushNotifications.Result[] | Error> => {
  const senderUser = await readDB('users').where({ id: senderUserId }).first();
  const recipientUser = await readDB('users').where({ id: recipientUserId }).first();
  if (!senderUser || !recipientUser) {
    return new Error('User not found');
  }
  const notification = generateNotificationData();
  notification.body = `${senderUser.display_name || senderUser.username} sent you a song!`;
  notification.title = '🥝 New Kiwi 🥝';
  notification.sound = 'activity_notification_sound.caf';
  notification.mutableContent = 1;
  notification.topic = 'org.reactjs.native.example.mutualsapp';
  notification.custom = {
    type: 'received_message',
    message_id: messageId,
    link: `kiwi://messages/received/${messageId}`,
  };
  return sendPushNotification([recipientUserId], notification);
};
/**
 *
 * @param requesterUserId The primary key id of the requester user
 * @param requestedUserId The primary key id of the requested user
 */
export const sendPushNotificationOnAcceptedFriendRequest = async (
  requesterUserId: number,
  requestedUserId: number,
): Promise<PushNotifications.Result[] | Error> => {
  const requestedUser = await readDB('users').where({ id: requestedUserId }).first();
  const requesterUser = await readDB('users').where({ id: requesterUserId }).first();
  if (!requestedUser || !requesterUser) {
    return new Error('No users found');
  }
  const notificationData = generateNotificationData();
  notificationData.body = `${requestedUser.display_name || requestedUser.username} added you back!`;
  notificationData.topic = 'org.reactjs.native.example.mutualsapp';
  notificationData.title = 'More songs coming your way!';
  notificationData.sound = 'activity_notification_sound.caf';
  notificationData.mutableContent = 1;
  notificationData.custom = {
    type: 'user',
    user_id: requestedUser.id,
    link: `kiwi://v1/users/${requestedUser.id}`,
  };
  return sendPushNotification([requesterUserId], notificationData);
};

export const sendNotificationOnNewReply = async ({
  recipientId,
  text,
  senderId,
  messageId,
}: {
  recipientId: number;
  text: string;
  senderId: number;
  messageId: number;
}): Promise<PushNotifications.Result[] | Error> => {
  const data = await readDB('users').select('*').where({ id: senderId }).first();
  const notificationData = generateNotificationData();
  notificationData.body = text;
  notificationData.topic = 'org.reactjs.native.example.mutualsapp';
  notificationData.title = data.display_name;
  notificationData.custom = { type: 'received_reply', message_id: messageId };
  notificationData.mutableContent = 1;
  return sendPushNotification([recipientId], notificationData);
};

export const sendNotificationOnLikeAction = async ({
  recipientId,
  senderId,
  messageId,
  like,
}: {
  recipientId: number;
  senderId: number;
  messageId: number;
  like: boolean;
}): Promise<PushNotifications.Result[] | Error> => {
  const data = await readDB('users').select('*').where({ id: recipientId }).first();
  const notificationData = generateNotificationData();
  const bodyText = `${data.display_name || data.username} ${like ? 'liked' : 'disliked'} your song`;
  notificationData.mutableContent = 1;
  notificationData.title = 'Kiwi';
  notificationData.custom = { link: `kiwi://messages/received/${messageId}` };
  notificationData.body = bodyText;
  notificationData.sound = 'activity_notification_sound.caf';
  notificationData.topic = 'org.reactjs.native.example.mutualsapp';

  return sendPushNotification([senderId], notificationData);
};

module.exports = {
  sendPushNotificationOnReceivedFriendRequest,
  sendPushNotificationOnAcceptedFriendRequest,
  sendNotificationOnReceivedSong,
  sendNotificationOnCreatedRating,
  sendNotificationOnNewReply,
  sendNotificationOnLikeAction,
};
