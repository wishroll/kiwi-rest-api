
module.exports = async (fastify, options) => {
  fastify.register(require('fastify-jwt'), {
    secret: process.env.MASTER_KEY
  })
  fastify.decorate('authenticate', async (req, res) => {
    try {
      await req.jwtVerify()
    } catch (err) {
      res.send(err)
    }
  })
  fastify.register(require('fastify-formbody'))
  fastify.decorate('redisClient', require('../services/db/redis/redis_client').client)
  fastify.decorate('knex', require('../services/db/postgres/knex_fastify_plugin'))
  fastify.decorate('twilioClient', require('../services/api/twilio/twilio_client'))
  fastify.register(require('./users'))
  fastify.register(require('./registration'))
  fastify.register(require('./sessions'))
  fastify.register(require('./conversations/index'))
  fastify.register(require('./media'))
  fastify.register(require('../services/api/spotify/spotify_authorization_controller'))
  fastify.register(require('../services/api/spotify/spotify_controller'))
  fastify.register(require('./general/'))
  fastify.register(require('./friends/'))
  fastify.register(require('./search'))
  fastify.register(require('./devices/'))
  fastify.register(require('./messages/index'))
  fastify.register(require('./ratings/index'))
  fastify.register(require('./widgets/index'))
  fastify.register(require('../services/api/firebase/cloud_messaging/index'))
}

/**
 *
 *  Routes for version one of the WishRoll API
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
