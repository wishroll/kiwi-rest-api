import { sendNotificationOnNewReply } from '../../services/notifications/notifications';
import { decrypt, encrypt } from '../../utils/encrypt';
import { BusinessLogicError, withErrorHandler } from '../../utils/errors';
import { WishrollFastifyInstance } from '../index';
import {
  RepliesSentParams,
  repliesSentSchema,
  CreateReplyBodyParams,
  CreateReplyBodyBody,
  createReplyBodySchema,
  UpdateReplyBody,
  UpdateReplyParams,
  updateReplySchema,
} from './schema';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{ Params: RepliesSentParams }>(
    '/messages/:id/replies',
    { onRequest: [fastify.authenticate], schema: repliesSentSchema },
    withErrorHandler(async (req, res) => {
      const recommendationMessageId = req.params.id;

      let replies = await fastify
        .readDb('replies')
        .select('*')
        .where({ message_id: recommendationMessageId })
        .orderBy('replies.created_at', 'desc');

      replies = replies.map(reply => ({
        ...reply,
        text: decrypt(reply.text),
      }));

      return res.status(200).send(replies);
    }),
  );

  fastify.post<{ Params: CreateReplyBodyBody; Body: CreateReplyBodyParams }>(
    '/messages/:id/replies',
    { onRequest: [fastify.authenticate], schema: createReplyBodySchema },
    withErrorHandler(async (req, res) => {
      const recommendationMessageId = req.params.id;
      const { recipient_id: recipientId, text } = req.body;

      // @ts-ignore
      const currentUserId = req.user.id;

      if (recipientId == currentUserId) {
        throw new BusinessLogicError(req, {
          statusCode: 500,
          additionalInfo: 'Can not send message to myself',
        });
      }

      const recipient = await fastify
        .readDb('users')
        .select('id')
        .where({ id: recipientId })
        .first();

      if (!recipient) {
        throw new BusinessLogicError(req, {
          statusCode: 500,
          additionalInfo: 'Recipient does not exists',
        });
      }

      await fastify.writeDb('replies').insert({
        message_id: recommendationMessageId,
        recipient_id: recipientId,
        sender_id: currentUserId,
        text: encrypt(text),
        seen: false,
      });
      return res
        .status(201)
        .send({ message: 'Reply sent succesfully' })
        .then(
          () => {
            sendNotificationOnNewReply({ recipientId, text, senderId: currentUserId });
          },
          e => {
            throw e;
          },
        );
    }),
  );

  fastify.put<{ Params: UpdateReplyParams; Body: UpdateReplyBody }>(
    '/messages/:id/replies/:reply_id',
    { onRequest: [fastify.authenticate], schema: updateReplySchema },
    withErrorHandler(async (req, res) => {
      const { id: recommendationMessageId, reply_id: replyId } = req.params;
      const { seen } = req.body;

      // @ts-ignore
      const currentUserId = req.user.id;

      const result = await fastify
        .writeDb('replies')
        .select('*')
        .where({ message_id: recommendationMessageId })
        .andWhere({ recipient_id: currentUserId })
        .andWhere({ id: replyId })
        .update({ seen }, [
          'id',
          'seen',
          'created_at',
          'text',
          'seen',
          'sender_id',
          'message_id',
          'recipient_id',
        ]);

      if (result.length === 0) {
        throw new BusinessLogicError(req, {
          statusCode: 500,
          additionalInfo: 'Could not update message',
        });
      }

      return res.status(201).send(result);
    }),
  );
};
