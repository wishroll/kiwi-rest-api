import { WishrollFastifyInstance } from '../index';
export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{}>(
    '/v1/chat_rooms/:chat_room_id/chat_room_members',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
    },
  );

  fastify.post<{}>(
    '/v1/chat_rooms/:chat_room_id/chat_room_members',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
    },
  );

  fastify.delete<{}>(
    '/v1/chat_room_members/:id',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {},
  );
};
