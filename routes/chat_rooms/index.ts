import { WishrollFastifyInstance } from '../index';
// import logger from '../../logger';
import { chatRoomsIndex, ChatRoomsIndexQuery } from './schema/v1';
import { withValidation } from '../../utils/validation';
import { chatRoomsSchema } from '../../models/chat_rooms';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{ Querystring: ChatRoomsIndexQuery }>(
    '/v1/chat_rooms',
    {
      onRequest: [fastify.authenticate],
      schema: chatRoomsIndex,
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

  fastify.post<{ Params: ChatRoomsIndexQuery }>(
    '/v1/chat_rooms',
    { onRequest: [fastify.authenticate], schema: chatRoomsIndex },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      try {
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.delete<{}>(
    '/v1/chat_rooms/:id',
    { onRequest: [fastify.authenticate], schema: chatRoomsIndex },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;
    },
  );

  fastify.put<{}>('/v1/chat_rooms/:id', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const currentUserId = req.user.id;
  });
};
