import { WishrollFastifyInstance } from '../index';
import {
  indexChatRoomMessagesSchema,
  IndexChatRoomMessagesParams,
  IndexChatRoomMessagesQueryString,
} from './schema/v1';
import {
  CreateChatRoomMessageBody,
  CreateChatRoomMessageParams,
  createChatRoomMessageSchema,
} from './schema/v1/create';
import { DeleteChatRoomMessageParams, deleteChatRoomMessageSchema } from './schema/v1/delete';
import { ShowChatRoomMessageParams, showChatRoomMessageSchema } from './schema/v1/show';
import {
  UpdateChatRoomMessageBody,
  UpdateChatRoomMessageParams,
  updateChatRoomMessageSchema,
} from './schema/v1/update';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{
    Querystring: IndexChatRoomMessagesQueryString;
    Params: IndexChatRoomMessagesParams;
  }>(
    '/v1/chat_rooms/:id/messages',
    { onRequest: [fastify.authenticate], schema: indexChatRoomMessagesSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;
    //   const limit = req.query.limit;
    //   const lastId = req.query.lastId;
    //   const chatRoomId = req.params.id;

      try {
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.post<{ Body: CreateChatRoomMessageBody; Params: CreateChatRoomMessageParams }>(
    '/v1/chat_room/:id/chat_room_messages',
    { onRequest: [fastify.authenticate], schema: createChatRoomMessageSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

    //   const chatRoomId = req.params.id;
      try {
        res.status(200).send();
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.delete<{ Params: DeleteChatRoomMessageParams }>(
    '/v1/chat_room_messages/:id',
    { onRequest: [fastify.authenticate], schema: deleteChatRoomMessageSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

    //   const chatRoomMessageId = req.params.id;
      try {
        res.status(200).send();
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Params: ShowChatRoomMessageParams }>(
    '/v1/chat_room_messages/:id',
    { onRequest: [fastify.authenticate], schema: showChatRoomMessageSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

    //   const chatRoomMessageId = req.params.id;
      try {
        res.status(200).send();
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.patch<{ Body: UpdateChatRoomMessageBody; Params: UpdateChatRoomMessageParams }>(
    '/v1/chat_room_messages/:id',
    { onRequest: [fastify.authenticate], schema: updateChatRoomMessageSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

    //   const chatRoomMessageId = req.params.id;
      try {
        res.status(200).send();
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );
};
