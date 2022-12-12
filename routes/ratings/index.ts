import { updateMessageSenderRating } from '../../algos/users/update_message_sender_rating';
import {
  sendNotificationOnCreatedRating,
  sendNotificationOnLikeAction,
} from '../../services/notifications/notifications';
import logger from '../../logger';
import { mapScoreToLike } from '../../algos/users/score_likes_mappers';
import create from './schema/v1/create';
import { WishrollFastifyInstance } from '../index';
import { withErrorHandler } from '../../utils/errors';
import { RateSongBody, RateSongParams, rateSongSchema } from './schema/v2/create';
import { default as updateRatingController } from './controller/update_ratings';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.post(
    '/v1/messages/:message_id/ratings',
    { onRequest: [fastify.authenticate], schema: create },
    async (req, res) => {
      // TO DO: Migrate schema to typescript and update types
      // @ts-ignore
      const messageId = req.params.message_id;
      // @ts-ignore
      const currentUserId = req.user.id;
      // @ts-ignore
      const score = req.body.score;
      try {
        const inserts = await fastify
          .writeDb('ratings')
          .insert(
            { user_id: currentUserId, message_id: messageId, score, like: mapScoreToLike(score) },
            ['*'],
          );
        if (inserts.length > 0) {
          updateMessageSenderRating(messageId, score);
          sendNotificationOnCreatedRating(messageId).catch(error => logger(req).error(error));
          res.status(201).send();
        } else {
          res.status(400).send({ error: true, message: 'Failed to create rating' });
        }
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get(
    '/v1/messages/:message_id/rating',
    { onRequest: fastify.authenticate },
    async (_req, _res) => {
      // Send Song Message ID
    },
  );

  fastify.post<{ Params: RateSongParams; Body: RateSongBody }>(
    '/v2/messages/:message_id/ratings',
    { onRequest: [fastify.authenticate], schema: rateSongSchema },
    withErrorHandler(async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;
      const like = req.body.like;
      const messageId = req.params.message_id;

      const updatedMessage = await updateRatingController(fastify)({
        currentUserId,
        like,
        messageId,
      });
      sendNotificationOnLikeAction({
        recipientId: currentUserId,
        senderId: updatedMessage.sender_id,
        messageId,
        like,
      }).catch(error => logger(req).error(error));

      res.status(201).send(updatedMessage);
    }),
  );
};
