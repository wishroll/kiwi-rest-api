const { default: logger } = require('../../logger');
const useragent = require('useragent');

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
      logger(req).error(err),
    );
    return res.send();
  });

  fastify.get('/store', (req, res) => {
    const agent = useragent.parse(req.headers['user-agent']);
    console.log(req, res);
    logger(req).trace({ req, res, device: agent.os }, 'test req res');

    let redirectUrl = 'https://www.wishroll.co';

    if (agent.os.family.toLowerCase() === 'ios') {
      redirectUrl = 'https://apps.apple.com/us/app/kiwi-live-music-recs-widget/id1614352817';
    } else if (agent.os.family.toLowerCase() === 'android') {
      // TODO: Update with actual google play store redirect
      redirectUrl = 'https://google.com';
    } else {
      logger(req).error(
        { agent, family: agent.os.family.toLowerCase() },
        'Could not recognize device family',
      );
    }

    return res.redirect(redirectUrl);
  });
};
