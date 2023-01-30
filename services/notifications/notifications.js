const push = require('./notification_settings');
const { readDB } = require('../db/postgres/knex_fastify_plugin');
const { default: logger } = require('../../logger');
const { default: androidNotification } = require('./android_notification_settings');
function generateNotificationData() {
  const data = {
    title: '', // REQUIRED for Android
    topic: '', // REQUIRED for iOS (apn and gcm)
    /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app.
     * When using certificate-based authentication, the topic is usually your app's bundle ID.
     * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
     */
    body: '',
    custom: null,
    priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high'
    collapseKey: '', // gcm for android, used as collapseId in apn
    contentAvailable: true, // gcm, apn. node-apn will translate true to 1 as required by apn.
    delayWhileIdle: true, // gcm for android
    restrictedPackageName: '', // gcm for android
    dryRun: false, // gcm for android
    icon: '', // gcm for android
    image: '', // gcm for android
    style: '', // gcm for android
    picture: '', // gcm for android
    tag: '', // gcm for android
    color: '', // gcm for android
    clickAction: '', // gcm for android. In ios, category will be used if not supplied
    locKey: '', // gcm, apn
    titleLocKey: '', // gcm, apn
    locArgs: undefined, // gcm, apn. Expected format: Stringified Array
    titleLocArgs: undefined, // gcm, apn. Expected format: Stringified Array
    retries: 5, // gcm, apn
    encoding: '', // apn
    badge: 0, // gcm for ios, apn
    sound: 'ping.aiff', // gcm, apn
    android_channel_id: '', // gcm - Android Channel ID
    notificationCount: 0, // fcm for android. badge can be used for both fcm and apn
    silent: false, // gcm, apn, will override badge, sound, alert and priority if set to true on iOS, will omit `notification` property and send as data-only on Android/GCM
    /*
     * A string is also accepted as a payload for alert
     * Your notification won't appear on ios if alert is empty object
     * If alert is an empty string the regular 'title' and 'body' will show in Notification
     */
    // alert: '',
    launchImage: '', // apn and gcm for ios
    action: '', // apn and gcm for ios
    category: '', // apn and gcm for ios
    // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands.
    // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
    urlArgs: '', // apn and gcm for ios
    truncateAtWordEnd: true, // apn and gcm for ios
    mutableContent: 0, // apn
    threadId: '', // apn
    pushType: undefined, // apn. valid values are 'alert' and 'background' (https://github.com/parse-community/node-apn/blob/master/doc/notification.markdown#notificationpushtype)
    expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // unit is seconds. if both expiry and timeToLive are given, expiry will take precedence
    timeToLive: 28 * 86400,
    headers: [], // wns
    launch: '', // wns
    duration: '', // wns
    consolidationKey: 'my notification', // ADM
  };
  return data;
}

function convertNotificationDataToAndroid(notificationData) {
  const message = {};
  if (notificationData.title) {
    message.notification = {};
    message.notification.title = notificationData.title;
  }
  if (notificationData.body) {
    if (!message.notification) {
      message.notification = {};
    }
    message.notification.body = notificationData.body;
  }
  if (notificationData.custom) {
    message.data = {};
    message.data = notificationData.custom;
  }
  return message;
}

function separateTokens(devices) {
  const tokens = devices.reduce(
    (acc, curr) => {
      if (curr.os.includes('ios')) {
        acc.ios = [...acc.ios, curr.token];
      } else if (curr.os.includes('android')) {
        acc.android = [...acc.android, curr.token];
      }
      return acc;
    },
    { android: [], ios: [] },
  );
  logger(null).trace(tokens, 'separateTokens');
  return tokens;
}
/**
 * Use the push notification module to push notifications to a list of users
 * @async
 * @param {number[]} userIds - The ids of the users intended to receive the notification
 * @param {Object} notificationData - The notification data
 * @returns {Promise<*>} Resolves the result of the notification or an error
 */
async function sendPushNotification(userIds, notificationData) {
  try {
    const devices = await readDB('devices')
      .select('*')
      .join('users', 'devices.user_id', '=', 'users.id')
      .whereIn('users.id', userIds);
    if (devices.length < 1) {
      const error = new Error('No devices');
      logger(null).error(error, 'No devices at sendPushNotification');
      // Check that device tokens isn't empty
      return error;
    }

    // Split tokens into ios and android
    const tokens = separateTokens(devices);

    const iosNotificationResult = await push.send(tokens.ios, notificationData);

    const androidNotificationResult = !tokens.android.length
      ? { success: 0, failure: 0 }
      : await androidNotification.sendToDevice(
          tokens.android,
          convertNotificationDataToAndroid(notificationData),
        );

    logger(null).trace({
      iosNotificationResult,
      androidNotificationResult,
      title: notificationData.title,
      body: notificationData.body,
    });

    return { iosNotificationResult, androidNotificationResult };
  } catch (error) {
    logger(null).error(error, 'An error occured when sending notification');
    return error;
  }
}
/**
 * Create a push notification when a user has rated a song
 * @param {number} messageId - The id of the message being rated
 * @returns {Promise<any>}
 */
const sendNotificationOnCreatedRating = async messageId => {
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

const sendPushNotificationOnReceivedFriendRequest = async (requestedUserId, requesterUserId) => {
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

async function sendDailyNotificationBlast(title, body) {
  const devices = await readDB('devices')
    .select('token')
    .join('users', 'devices.user_id', '=', 'users.id');
  if (devices.length < 1) {
    return new Error('No devices');
  }
  const notificationData = generateNotificationData();
  notificationData.title = title;
  notificationData.body = body;
  notificationData.topic = 'org.reactjs.native.example.mutualsapp';
  notificationData.sound = 'activity_notification_sound.caf';
  notificationData.pushType = 'alert';
  const tokens = devices.map(t => ({ token: t.token, os: t.os }));
  const batchSize = 100;
  const task = ({ token, os }) => {
    if (os === 'ios') {
      push.send(token, notificationData);
    } else {
      androidNotification.sendToDevice(token, convertNotificationDataToAndroid(notificationData));
    }
  };
  return promiseAllInBatches(task, tokens, batchSize);
}

/**
 * Same as Promise.all(items.map(item => task(item))), but it waits for
 * the first {batchSize} promises to finish before starting the next batch.
 *
 * @template A
 * @template B
 * @param {function(A): B} task The task to run for each item.
 * @param {A[]} items Arguments to pass to the task for each call.
 * @param {int} batchSize
 * @returns {Promise<B[]>}
 */
async function promiseAllInBatches(task, items, batchSize) {
  let position = 0;
  let results = [];
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize);
    results = [...results, ...(await Promise.allSettled(itemsForBatch.map(item => task(item))))];
    position += batchSize;
  }
  return results;
}

async function sendNotificationOnReceivedSong(messageId, senderUserId, recipientUserId) {
  const senderUser = await readDB('users').where({ id: senderUserId }).first();
  const recipientUser = await readDB('users').where({ id: recipientUserId }).first();
  if (!senderUser || !recipientUser) {
    logger(null).error(
      { senderUser, recipientUser },
      'User not found at sendNotificationOnReceivedSong',
    );
    return new Error('User not found');
  }
  const notification = generateNotificationData();
  notification.body = `${senderUser.display_name || senderUser.username} sent you a song!`;
  notification.title = '🥝 New Kiwi 🥝';
  notification.sound = 'activity_notification_sound.caf';
  notification.pushType = 'alert';
  notification.mutableContent = 1;
  notification.topic = 'org.reactjs.native.example.mutualsapp';
  notification.custom = {
    type: 'received_message',
    message_id: messageId,
    link: `kiwi://messages/received/${messageId}`,
  };
  return sendPushNotification([recipientUserId], notification);
}

const sendPushNotificationOnAcceptedFriendRequest = async (requesterUserId, requestedUserId) => {
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

const sendNotificationOnNewReply = async ({ recipientId, text, senderId, messageId }) => {
  const data = await readDB('users').select('*').where({ id: senderId }).first();
  const notificationData = generateNotificationData();
  notificationData.body = text;
  notificationData.topic = 'org.reactjs.native.example.mutualsapp';
  notificationData.title = data.display_name;
  notificationData.custom = { type: 'received_reply', message_id: messageId };
  notificationData.mutableContent = 1;
  return sendPushNotification([recipientId], notificationData);
};

const sendNotificationOnLikeAction = async ({ recipientId, senderId, messageId, like }) => {
  const data = await readDB('users').select('*').where({ id: recipientId }).first();
  const notificationData = generateNotificationData();
  const bodyText = `${data.display_name || data.username} ${like ? 'liked' : 'disliked'} your song`;
  notificationData.mutableContent = 1;
  notificationData.title = 'Kiwi';
  notificationData.custom = { link: `kiwi://messages/received/${messageId}` };
  notificationData.body = bodyText;
  notificationData.sound = 'activity_notification_sound.caf';
  notificationData.pushType = 'alert';
  notificationData.topic = 'org.reactjs.native.example.mutualsapp';

  return sendPushNotification([senderId], notificationData);
};

module.exports = {
  sendPushNotificationOnReceivedFriendRequest,
  sendPushNotificationOnAcceptedFriendRequest,
  sendDailyNotificationBlast,
  sendNotificationOnReceivedSong,
  sendNotificationOnCreatedRating,
  sendNotificationOnNewReply,
  sendNotificationOnLikeAction,
};
