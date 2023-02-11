import { WishrollFastifyInstance } from '../index';
// import logger from '../../logger';
import { indexChatRoomsSchema, ChatRoomsIndexQuery } from './schema/v1';
import { withValidation } from '../../utils/validation';
import { chatRoomsSchema } from '../../models/chat_rooms';
import { createChatRoomSchema } from './schema/v1/create';
import { DeleteChatRoomParams, deleteChatRoomSchema } from './schema/v1/delete';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{ Querystring: ChatRoomsIndexQuery }>(
    '/v1/chat_rooms',
    {
      onRequest: [fastify.authenticate],
      schema: indexChatRoomsSchema,
    },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const limit = req.query.limit;
      //   const lastId = req.query.lastId;
      try {
        const chatRooms = withValidation(
          await fastify
            .readDb('chat_rooms')
            .rightOuterJoin('chat_room_members', 'chat_rooms.id', 'chat_room_members.chat_room_id')
            .join('users', 'chat_room_members.user_id', 'users.id')
            .where('users.id', currentUserId)
            // .andWhere('id', '>', lastId)
            .limit(limit),
          chatRoomsSchema,
        );

        if (chatRooms.length < 1) {
          return res.status(200).send([]);
        }

        res.status(200).send(chatRooms);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.post(
    '/v1/chat_rooms',
    { onRequest: [fastify.authenticate], schema: createChatRoomSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      try {
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.delete<{ Params: DeleteChatRoomParams }>(
    '/v1/chat_rooms/:id',
    { onRequest: [fastify.authenticate], schema: deleteChatRoomSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;
      try {
        res.status(200).send();
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );
};
