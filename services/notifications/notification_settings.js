const PushNotifications = require('node-pushnotifications')
const settings = {
  apn: {
    token: {
      key: process.env.APN_KEY_PATH,
      keyId: process.env.APN_KEY_ID,
      teamId: process.env.APN_TEAM_ID
    },
    production: process.env.NODE_ENV === 'production'
  }
}

const push = new PushNotifications(settings)
module.exports = push
