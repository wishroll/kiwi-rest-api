import { FastifyReply, FastifyRequest } from 'fastify';
import { FastifyInstance } from 'fastify/types/instance';
import { RedisClientType } from 'redis';
const redisMock = require('fastify-redis-mock');
const fastifyEnv = require('fastify-env');
import 'fastify-jwt/jwt';
import { Knex } from 'knex';
import { options } from '../services/env_schema';

export interface WishrollFastifyInstance extends FastifyInstance {
  authenticate: () => void;
  redisClient: RedisClientType;
  jwtVerify: () => void;
  readDb: Knex;
  writeDb: Knex;
}

export default async (fastify: WishrollFastifyInstance, _options: any, _done: any) => {
  await fastify.register(fastifyEnv, options);

  fastify.register(require('fastify-jwt'), {
    secret: process.env.MASTER_KEY ?? '',
  });
  fastify.register(require('fastify-formbody'));

  fastify.decorate('authenticate', async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      res.send(err);
    }
  });

  if (process.env.NODE_ENV === 'test') {
    fastify.register(redisMock);
  } else {
    fastify.decorate('redisClient', require('../services/db/redis/redis_client').client);
  }

  fastify.decorate('readDb', require('../services/db/postgres/knex_fastify_plugin').readDB);
  fastify.decorate('writeDb', require('../services/db/postgres/knex_fastify_plugin').writeDB);
  fastify.decorate('twilioClient', require('../services/api/twilio/twilio_client'));
  fastify.register(require('./users'));
  fastify.register(require('./registration'));
  fastify.register(require('./sessions'));
  fastify.register(require('./conversations/index'));
  fastify.register(require('./media'));
  fastify.register(require('../services/api/spotify/spotify_authorization_controller'));
  fastify.register(require('../services/api/spotify/spotify_controller'));
  fastify.register(require('./general/'));
  fastify.register(require('./friends/'));
  fastify.register(require('./search'));
  fastify.register(require('./devices/'));
  fastify.register(require('./messages/index'));
  fastify.register(require('./ratings/index'));
  fastify.register(require('./widgets/index'));
  fastify.register(require('../services/api/firebase/cloud_messaging/index'));
  fastify.register(require('../services/api/spotify/tokens'));
  fastify.register(require('./replies/index'));
  fastify.register(require('./notifications/index'));
  fastify.register(require('../services/api/deezer/index'));
};
