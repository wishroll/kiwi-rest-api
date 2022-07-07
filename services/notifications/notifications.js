const push = require("./notification_settings")
const knex = require("../db/postgres/knex_fastify_plugin")
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
        consolidationKey: 'my notification', // ADM
    }
    return data
}



const  sendNotificationOnReceivedFriendRequest = (recipientUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await knex('users').where({id: recipientUserId}).first()
            if(!user) {
                reject('User not found')
            }
            const device = await knex('devices').join('users', 'devices.user_id', '=', 'users.id').where('users.id', '=', recipientUserId).first()
            if(!device) {
                reject('No device found!')
            }
            const notificationData = generateNotificationData()
            notificationData.title = `${user.display_name || user.username} wants to be friends!`
            notificationData.topic = 'org.reactjs.native.example.mutualsapp'
            notificationData.body = 'Check out their profile!'
            notificationData.sound = "activity_notification_sound.caf"
            notificationData.mutableContent = 1
            notificationData.custom = {
                user: user,
                type: 'ReceivedFriendRequest'
            }
            const result = await push.send([device.token], notificationData)
            console.log(result[0].message[0].errorMsg, notificationData.title, notificationData.body)
            resolve(result)
        } catch (error) {
            console.log('An error occured when sending notification', error)
            reject(error)
        }
    })
}
module.exports = sendNotificationOnReceivedFriendRequest