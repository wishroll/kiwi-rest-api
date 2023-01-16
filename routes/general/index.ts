import { WishrollFastifyInstance } from '../index';
import logger from '../../logger';

export default async (fastify: WishrollFastifyInstance) => {
  const { sendDailyNotificationBlast } = require('../../services/notifications/notifications');
  fastify.get('/:platform/appstore', async (_req, res) => {
    return res.redirect('https://apps.apple.com/us/app/kiwi-live-music-recs-widget/id1614352817');
  });

  fastify.post(
    '/notifications/daily-blast',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      //@ts-ignore
      const { body: notificationBody, title: notificationTitle } = req.body;
      if (!notificationBody || notificationBody.length < 1) {
        return res.status(400).send({ error: true, message: 'Missing notification body' });
      }
      if (!notificationTitle || notificationTitle.length < 1) {
        return res.status(400).send({ error: true, message: 'Missing notification title' });
      }
      sendDailyNotificationBlast(notificationTitle, notificationBody).catch((err: any) =>
        logger(req).error(err),
      );
      return res.send();
    },
  );
};
