import { WishrollFastifyInstance } from '..';
import logger from '../../logger';
import {
  sendNotificationOnReceivedSong,
  sendPushNotificationOnReceivedFriendRequest,
  sendNotificationOnCreatedRating,
} from '../../services/notifications/notifications';
import { MessagesBody } from './schema';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.post<{
    Body: MessagesBody;
  }>('/v1/notifications/messages/test', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const { recipient_id, sender_id, message_id } = req.body;

    try {
      await sendNotificationOnReceivedSong(
        message_id ?? '51',
        sender_id ?? '481123',
        recipient_id ?? '481123',
      );
      res.status(204);
    } catch (e) {
      if (e instanceof Error) {
        logger(req).error(e);
      }
      res.status(500).send({ error: true, message: 'not working' });
    }
  });

  fastify.post('/v2/friends/test', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const currentUserId = '481123';
    const requestedUserId = '481123';

    try {
      await sendPushNotificationOnReceivedFriendRequest(requestedUserId, currentUserId);
      res.status(204);
    } catch (e) {
      if (e instanceof Error) {
        logger(req).error(e);
      }
      res.status(500).send({ error: true, message: 'not working' });
    }
  });

  fastify.post(
    '/messages/ratings/test',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const messageId = 51;

      try {
        await sendNotificationOnCreatedRating(messageId);
        res.status(204);
      } catch (e) {
        if (e instanceof Error) {
          logger(req).error(e);
        }
        res.status(500).send({ error: true, message: 'not working' });
      }
    },
  );
};
