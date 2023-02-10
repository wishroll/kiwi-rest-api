import { WishrollFastifyInstance } from '../index';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{}>(
    '/v1/chat_rooms/:chat_room_id/messages',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
      const limit = req.query.limit;
      const lastId = req.query.lastId;

      try {
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.post<{}>(
    '/v1/chat_room_messages',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
    },
  );

  fastify.delete<{}>(
    '/v1/chat_room_messages/:id',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
    },
  );

  fastify.get<{}>(
    '/v1/chat_room_messages/:id',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
    },
  );

  fastify.patch<{}>(
    '/v1/chat_room_messages/:id',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
    },
  );
};
