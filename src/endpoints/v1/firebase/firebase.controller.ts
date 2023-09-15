import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default async (fastify: FastifyInstance) => {
  fastify.post<{ Body: { token: string } }>(
    '/firebase/cloud_messaging/users/tokens',
    { onRequest: [fastify.authenticate] },
    async (req: FastifyRequest<{ Body: { token: string } }>, res: FastifyReply) => {
      const token = req.body.token;
      const currentUserId = req.user.id;
      try {
        const cloudToken = await fastify.prisma.firebaseCloudMessagingToken.upsert({
          create: { token, user_id: currentUserId },
          update: { token },
          where: { user_id_token: { token, user_id: currentUserId } },
        });
        res.status(201).send(cloudToken);
      } catch (error) {
        res.status(500).send({ error: true, message: 'Internal Server Error' });
      }
    },
  );
};
