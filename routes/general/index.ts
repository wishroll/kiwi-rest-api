import { WishrollFastifyInstance } from '../index';
import logger from '../../logger';
import useragent from 'useragent';

export default async (fastify: WishrollFastifyInstance) => {
  const { sendDailyNotificationBlast } = require('../../services/notifications/notifications');
  fastify.get('/:platform/appstore', async (_req, res) => {
    return res.redirect('https://apps.apple.com/us/app/kiwi-live-music-recs-widget/id1614352817');
  });

  fastify.post(
    '/notifications/daily-blast',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      // @ts-ignore
      const { body: notificationBody, title: notificationTitle } = req.body;
      if (!notificationBody || notificationBody.length < 1) {
        return res.status(400).send({ error: true, message: 'Missing notification body' });
      }
      if (!notificationTitle || notificationTitle.length < 1) {
        return res.status(400).send({ error: true, message: 'Missing notification title' });
      }
      sendDailyNotificationBlast(notificationTitle, notificationBody).catch((err: unknown) => {
        if (err instanceof Error) {
          logger(req).error(err);
          return;
        }

        logger(req).info(`Unexpected error happened! ${err}`);
      });
      return res.send();
    },
  );

  fastify.get('/store', async (req, res) => {
    const agent = useragent.parse(req.headers['user-agent']);
    let redirectUrl = 'https://www.wishroll.co';

    if (agent.os.family.toLowerCase() === 'ios') {
      redirectUrl = 'https://apps.apple.com/us/app/kiwi-live-music-recs-widget/id1614352817';
    } else if (agent.os.family.toLowerCase() === 'android') {
      redirectUrl = 'https://play.google.com/store/apps/details?id=co.wishroll';
    } else {
      logger(req).info(
        { agent, family: agent.os.family.toLowerCase() },
        'Could not recognize device family',
      );
    }

    return res.redirect(redirectUrl);
  });

  fastify.get('/healthcheck', async () => {
    return { status: 'OK' };
  });
};
