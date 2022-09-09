import { WishrollFastifyInstance } from '../index';
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';
const index = require('./schema/v1/users/index');
const { searchUsers } = require('../../services/api/neo4j/search/index');

module.exports = async (fastify: WishrollFastifyInstance) => {
  fastify.get(
    '/search/users',
    { onRequest: [fastify.authenticate], schema: index },
    async (
      req: FastifyRequest<{ Querystring: { query: string; limit: string; offset: string } }>,
      res: FastifyReply,
    ) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const { query, limit, offset } = req.query;

      if (!query || query.length < 1) {
        return res.status(400).send({ error: true, message: 'Missing Query' });
      }

      const cacheKey = `get-search-users-${query.toLowerCase()}-${limit}-${offset}-${currentUserId}`;

      const cachedResponse = await fastify.redisClient.get(cacheKey);

      if (cachedResponse) {
        return res.status(200).send(JSON.parse(cachedResponse));
      }

      try {
        const users = await searchUsers(query, offset, limit, currentUserId);

        fastify.redisClient.set(cacheKey, JSON.stringify(users), { EX: 60 * 60 * 5 });

        return res.status(200).send(users);
      } catch (error) {
        console.log(error);
        return res.status(500).send({ error });
      }
    },
  );
};
