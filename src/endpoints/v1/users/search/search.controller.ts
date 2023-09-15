import { FastifyPluginAsync } from 'fastify';
import { FastifyInstance } from 'fastify/types/instance';
import { searchUserHandler } from './search.handler';
import { $ref, SearchUserQueryString } from './search.schema';

const search: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get<{ Querystring: SearchUserQueryString }>(
    '/search',
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: $ref('searchUserQueryStringSchema'),
        response: { 200: $ref('searchUserResponseSchema') },
      },
    },
    searchUserHandler,
  );
};
export default search;
