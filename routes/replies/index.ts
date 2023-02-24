import { sendNotificationOnNewReply } from '../../services/notifications/notifications';
import { decrypt, encrypt } from '../../utils/encrypt';
import { BusinessLogicError, withErrorHandler } from '../../utils/errors';
import { MAX_BIGINT } from '../../utils/numbers';
import { WishrollFastifyInstance } from '../index';
import {
  RepliesSentParams,
  repliesSentSchema,
  CreateReplyBodyParams,
  CreateReplyBodyBody,
  createReplyBodySchema,
  markAsSeenSchema,
  MarkAsSeenParams,
  RepliesSentQuerystring,
} from './schema';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{ Params: RepliesSentParams; Querystring: RepliesSentQuerystring }>(
    '/messages/:id/replies',
    { onRequest: [fastify.authenticate], schema: repliesSentSchema },
    withErrorHandler(async (req, res) => {
      const parentMessageId = req.params.id;
      const limit = req.query.limit;
      const lastId = req.query.lastId ?? MAX_BIGINT;

      let replies = await fastify
        .readDb('replies')
        .select('*')
        .where({ message_id: parentMessageId })
        // @ts-ignore
        .andWhere('replies.id', '<', lastId)
        .orderBy('replies.created_at', 'desc')
        .limit(limit);

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
      const parentMessageId = req.params.id;
      const { recipient_id: recipientId, text } = req.body;

      // @ts-ignore
      const currentUserId = req.user.id;

      if (recipientId === currentUserId) {
        throw new BusinessLogicError(req, {
          statusCode: 500,
          additionalInfo: 'Can not send message to myself',
        });
      }

      if (!text) {
        throw new BusinessLogicError(req, {
          statusCode: 500,
          additionalInfo: 'Message can not be empty',
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

      const reply = await fastify.writeDb('replies').insert(
        {
          message_id: parentMessageId,
          recipient_id: recipientId,
          sender_id: currentUserId,
          text: encrypt(text),
        },
        ['*'],
      );

      if (!reply) {
        throw new BusinessLogicError(req, {
          statusCode: 500,
          additionalInfo: 'Could not send reply',
        });
      }

      const message = await fastify
        .writeDb('messages')
        .select('*')
        .where({ id: parentMessageId })
        .update(
          {
            seen: false,
            last_sender_id: currentUserId,
          },
          ['*'],
        );

      return res
        .status(201)
        .send({
          reply: { ...reply[0], text: decrypt(reply[0].text) },
        })
        .then(
          () => {
            sendNotificationOnNewReply({
              recipientId,
              text,
              senderId: currentUserId,
              messageId: message[0].id,
            });
          },
          e => {
            throw e;
          },
        );
    }),
  );

  fastify.post<{ Params: MarkAsSeenParams }>(
    '/messages/:id/mark_as_seen',
    { onRequest: [fastify.authenticate], schema: markAsSeenSchema },
    withErrorHandler(async (req, res) => {
      const { id: parentMessageId } = req.params;

      // @ts-ignore
      const currentUserId = req.user.id;

      const result = await fastify
        .writeDb('messages')
        .select('*')
        .where({ id: parentMessageId })
        .andWhere('last_sender_id', '<>', currentUserId)
        .update({ seen: true }, ['*']);

      if (result.length === 0) {
        throw new BusinessLogicError(req, {
          statusCode: 404,
          additionalInfo: 'Could not update message',
        });
      }

      return res.status(201).send(result);
    }),
  );
};
