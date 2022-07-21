const routes = async (fastify, options) => {
  const {sendDailyNotificationBlast} = require('../../../../services/notifications/notifications')
  fastify.get('/:platform/appstore', (req, res) => {
    return res.redirect('https://apps.apple.com/us/app/kiwi-live-music-recs-widget/id1614352817')
  })

  fastify.post('/notifications/daily-blast', (req, res) => {
    sendDailyNotificationBlast().catch((err) => console.log(err))
    return res.send()
  })
}

module.exports = routes
