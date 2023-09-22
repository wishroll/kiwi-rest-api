import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { updateProfileHandler } from './profile.handler';
import { $ref, UpdateProfileBody } from './profile.schema';

const profile: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.put<{ Body: UpdateProfileBody }>(
    '/me',
    {
      onRequest: [fastify.authenticate],
      schema: { body: $ref('updateProfileBodySchema') },
    },
    updateProfileHandler,
  );
};

export default profile;
