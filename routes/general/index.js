module.exports = async (fastify, _options) => {
  const { sendDailyNotificationBlast } = require('../../services/notifications/notifications');
  fastify.get('/:platform/appstore', (req, res) => {
    return res.redirect('https://apps.apple.com/us/app/kiwi-live-music-recs-widget/id1614352817');
  });

  fastify.post('/notifications/daily-blast', { onRequest: [fastify.authenticate] }, (req, res) => {
    const notificationBody = req.body.body;
    const notificationTitle = req.body.title;
    if (!notificationBody || notificationBody.length < 1) {
      return res.status(400).send({ error: true, message: 'Missing notification body' });
    }
    if (!notificationTitle || notificationTitle.length < 1) {
      return res.status(400).send({ error: true, message: 'Missing notification title' });
    }
    sendDailyNotificationBlast(notificationTitle, notificationBody).catch(err =>
      req.log.error(err),
    );
    return res.send();
  });
};
