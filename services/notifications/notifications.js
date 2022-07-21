const push = require('./notification_settings')
const knex = require('../db/postgres/knex_fastify_plugin')
function generateNotificationData () {
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
    retries: 1, // gcm, apn
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

const sendPushNotification = async (userIds, notificationData) => {
  try {
    const devices = await knex('devices').select('token').joins('users', 'devices.user_id', '=', 'users.id').whereIn('users.id', userIds)
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

const sendPushNotificationOnReceivedFriendRequest = async (recipientUserId) => {
  try {
    const user = await knex('users').where({ id: recipientUserId }).first()
    const notificationData = generateNotificationData()
    notificationData.title = `${user.display_name || user.username} wants to be friends!`
    notificationData.topic = 'org.reactjs.native.example.mutualsapp'
    notificationData.body = 'Check out their profile!'
    notificationData.sound = 'activity_notification_sound.caf'
    notificationData.mutableContent = 1
    notificationData.custom = {
      user,
      type: 'ReceivedFriendRequest'
    }
    return sendPushNotification([recipientUserId], notificationData)
  } catch (error) {
    console.log(error)
  }
}

async function sendDailyNotificationBlast() {
    const devices = await knex('devices').select('token').join('users', 'devices.user_id', '=', 'users.id')
    if(devices.length < 1) {
      return new Error('No devices')
    }
    const tokens = devices.map(t => t.token)
    console.log(tokens)
    const notificationData = generateNotificationData()
    notificationData.title = 'It’s kiwi time 🥝'
    notificationData.body = 'Send your most recently played song to your friends - you have 2 minutes!'
    notificationData.topic = 'org.reactjs.native.example.mutualsapp'
    notificationData.sound = 'activity_notification_sound.caf'
    notificationData.pushType = 'alert'
    const result = await push.send(tokens, notificationData)
    return result
}

async function sendNotificationOnReceivedSong(senderUserId, recipientUserId) {
  const senderUser = await knex('users').where({ id: senderUserId }).first()
  const recipientUser = await knex('users').where({ id: recipientUserId }).first()
  if (!senderUser || !recipientUser) {
    return new Error('User not found')
  }
  const notification = generateNotificationData()
  notification.title = 'Kiwi'
  notification.body = `${senderUser.display_name || senderUser.username} sent you a song.\nYou have two minutes to view the message before it expires!`
  notification.sound = 'activity_notification_sound.caf'
  notification.pushType = 'alert'
  notification.mutableContent = 1
  notification.topic = 'org.reactjs.native.example.mutualsapp'
  return sendPushNotification([recipientUserId], notification)
}

const sendPushNotificationOnAcceptedFriendRequest = (requesterUserId) => {

}
module.exports = { sendPushNotificationOnReceivedFriendRequest, sendDailyNotificationBlast, sendNotificationOnReceivedSong }
