import { WishrollFastifyInstance } from '../index';
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';
import { searchUsersV2 } from '../../services/api/neo4j/search';
import { search } from './schema/v1/users/index';
import { search as searchV2 } from './schema/v2/users/index';
import { searchUsers } from '../../services/api/neo4j/search/index';
import { MAX_32INT_NEO4J, MAX_SEARCH_MATCH_SCORE } from '../../utils/numbers';
import logger from '../../logger';

module.exports = async (fastify: WishrollFastifyInstance) => {
  fastify.get(
    '/search/users',
    { onRequest: [fastify.authenticate], schema: search },
    async (
      req: FastifyRequest<{ Querystring: { query: string; limit: number; offset: number } }>,
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

        fastify.redisClient.set(cacheKey, JSON.stringify(users), { EX: 60 * 5 });

        return res.status(200).send(users);
      } catch (error) {
        if (error instanceof Error) {
          logger(req).error(error);
        } else {
          req.log.error(error);
        }
        return res.status(500).send({ error });
      }
    },
  );

  fastify.get(
    '/v2/search/users',
    { onRequest: [fastify.authenticate], schema: searchV2 },
    async (
      req: FastifyRequest<{
        Querystring: { query: string; limit: number; lastScore?: string; lastId?: number };
      }>,
      res: FastifyReply,
    ) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const { query, limit, lastId, lastScore } = req.query;

      if (!query || query.length < 1) {
        return res.status(400).send({ error: true, message: 'Missing Query' });
      }

      const cacheKey = `get-v2-search-users-${query.toLowerCase()}-${limit}-${currentUserId}-${
        lastId ?? MAX_32INT_NEO4J
      }-${lastScore ?? MAX_SEARCH_MATCH_SCORE}`;

      const cachedResponse = await fastify.redisClient.get(cacheKey);

      if (cachedResponse) {
        return res.status(200).send(JSON.parse(cachedResponse));
      }

      try {
        const users = await searchUsersV2(query, limit, currentUserId, lastId, lastScore);

        fastify.redisClient.set(cacheKey, JSON.stringify(users), { EX: 60 * 60 * 5 });

        return res.status(200).send(users);
      } catch (error) {
        if (error instanceof Error) {
          logger(req).error(error);
        } else {
          req.log.error(error);
        }
        return res.status(500).send({ error });
      }
    },
  );
};
