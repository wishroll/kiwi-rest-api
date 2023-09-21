import fp from 'fastify-plugin';
import { RedisClientType } from 'redis';

export default fp(async fastify => {
  fastify.decorate('redisClient');
});

declare module 'fastify' {
  interface FastifyInstance {
    redisClient: RedisClientType;
  }
}
