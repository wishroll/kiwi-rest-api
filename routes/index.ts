import { FastifyReply, FastifyRequest } from 'fastify';
import { FastifyInstance } from 'fastify/types/instance';
import { RedisClientType } from 'redis';

// needed to import to extend fastify types
import 'fastify-jwt/jwt';
import { Knex } from 'knex';

export interface WishrollFastifyInstance extends FastifyInstance {
  authenticate: () => void;
  redisClient: RedisClientType;
  jwtVerify: () => void;
  readDb: Knex;
  writeDb: Knex;
}

module.exports = async (fastify: WishrollFastifyInstance, _options: any) => {
  fastify.register(require('fastify-jwt'), {
    secret: process.env.MASTER_KEY,
  });
  fastify.decorate('authenticate', async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      res.send(err);
    }
  });
  fastify.register(require('fastify-formbody'));
  fastify.decorate('redisClient', require('../services/db/redis/redis_client').client);
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
};
