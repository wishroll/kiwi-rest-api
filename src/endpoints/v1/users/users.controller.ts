import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getUserHandler } from './users.handler';
import { $ref, GetUserParam } from './users.schema';

const users: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get<{ Params: GetUserParam }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: $ref('getUserSchemaParams'),
        response: { 200: $ref('getUserResponseSchema') },
      },
    },
    getUserHandler,
  );
};

export default users;
