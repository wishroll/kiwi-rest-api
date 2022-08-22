const push = require('./notification_settings')
const { readDB } = require('../db/postgres/knex_fastify_plugin')
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
    consolidationKey: 'my notification' // ADM
  }
  return data
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
    const devices = await readDB('devices').select('token').join('users', 'devices.user_id', '=', 'users.id').whereIn('users.id', userIds)
    if (devices.length < 1) { // Check that device tokens isn't empty
      return new Error('No devices')
    }
    const tokens = devices.map(t => t.token)
    const result = await push.send(tokens, notificationData)
    console.log(result[0].message[0].errorMsg, notificationData.title, notificationData.body)
    return result
  } catch (error) {
    console.log('An error occured when sending notification', error)
    return error
  }
}
/**
 * Create a push notification when a user has rated a song
 * @param {number} messageId - The id of the message being rated 
 * @returns {Promise<any>}
 */
const sendNotificationOnCreatedRating = async (messageId) => {
  const userId = await readDB('users').select('users.id').innerJoin('messages', 'users.id', '=', 'messages.sender_id').where('messages.id', '=', messageId).first();
  console.log('This is the userId of the message sender', userId.id)
  const notificationData = generateNotificationData()
  notificationData.body = `Someone just rated a song you sent! Check out your updated music rating`
  notificationData.topic = 'org.reactjs.native.example.mutualsapp'
  notificationData.title = `New rating 👀`
  notificationData.mutableContent = 1
  return sendPushNotification([userId.id], notificationData)
}

const sendPushNotificationOnReceivedFriendRequest = async (requestedUserId, requesterUserId) => {
  const requestedUser = await readDB('users').where({ id: requestedUserId }).first()
  const requesterUser = await readDB('users').where({ id: requesterUserId }).first()
  if (!requestedUser || !requesterUser) {
    return new Error('No users found')
  }
  const notificationData = generateNotificationData()
  notificationData.body = `${requesterUser.display_name || requesterUser.username} added you!\nAdd them back to start sending songs.`
  notificationData.topic = 'org.reactjs.native.example.mutualsapp'
  notificationData.title = 'More songs coming your way!'
  notificationData.sound = 'activity_notification_sound.caf'
  notificationData.mutableContent = 1
  notificationData.custom = {
    requester_user: requesterUser,
    type: 'ReceivedFriendRequest'
  }
  return sendPushNotification([requestedUserId], notificationData)
}

async function sendDailyNotificationBlast(title, body) {
  const devices = await readDB('devices').select('token').join('users', 'devices.user_id', '=', 'users.id')
  if (devices.length < 1) {
    return new Error('No devices')
  }
  const notificationData = generateNotificationData()
  notificationData.title = title
  notificationData.body = body
  notificationData.topic = 'org.reactjs.native.example.mutualsapp'
  notificationData.sound = 'activity_notification_sound.caf'
  notificationData.pushType = 'alert'
  const tokens = devices.map(t => t.token)
  const batchSize = 100
  const task = (token) => {
    push.send(token, notificationData)
  }
  return promiseAllInBatches(task, tokens, batchSize)
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
    results = [...results, ...await Promise.allSettled(itemsForBatch.map(item => task(item)))];
    position += batchSize;
  }
  return results;
}

async function sendNotificationOnReceivedSong(senderUserId, recipientUserId) {
  const senderUser = await readDB('users').where({ id: senderUserId }).first()
  const recipientUser = await readDB('users').where({ id: recipientUserId }).first()
  if (!senderUser || !recipientUser) {
    return new Error('User not found')
  }
  const notification = generateNotificationData()
  notification.body = `${senderUser.display_name || senderUser.username} sent you a song!`
  notification.title = '🥝 New Kiwi 🥝'
  notification.sound = 'activity_notification_sound.caf'
  notification.pushType = 'alert'
  notification.mutableContent = 1
  notification.topic = 'org.reactjs.native.example.mutualsapp'
  return sendPushNotification([recipientUserId], notification)
}

const sendPushNotificationOnAcceptedFriendRequest = async (requesterUserId, requestedUserId) => {
  const requestedUser = await readDB('users').where({ id: requestedUserId }).first()
  const requesterUser = await readDB('users').where({ id: requesterUserId }).first()
  if (!requestedUser || !requesterUser) {
    return new Error('No users found')
  }
  const notificationData = generateNotificationData()
  notificationData.body = `${requestedUser.display_name || requestedUser.username} added you back! You can now send songs to each other.`
  notificationData.topic = 'org.reactjs.native.example.mutualsapp'
  notificationData.title = 'More songs coming your way!'
  notificationData.sound = 'activity_notification_sound.caf'
  notificationData.mutableContent = 1
  notificationData.custom = {
    requested_user: requestedUser,
    type: 'AcceptedFriendRequest'
  }
  return sendPushNotification([requesterUserId], notificationData)
}
module.exports = { sendPushNotificationOnReceivedFriendRequest, sendPushNotificationOnAcceptedFriendRequest, sendDailyNotificationBlast, sendNotificationOnReceivedSong, sendNotificationOnCreatedRating }
