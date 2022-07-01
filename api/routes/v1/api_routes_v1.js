
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
  fastify.decorate('redisClient', require('../../../services/db/redis/redis_client').client)
  fastify.decorate('knex', require('../../../services/db/postgres/knex_fastify_plugin'))
  fastify.decorate('twilioClient', require('../../../services/api/twilio/twilio_client'))
  fastify.register(require('./users/users_controller'))
  fastify.register(require('./registration/signup_controller'))
  fastify.register(require('./sessions/sessions_controller'))
  fastify.register(require('./answers/answers_controller'))
  fastify.register(require('./chats/chats_controller'))
  fastify.register(require('./media/media_controller'))
  fastify.register(require('./questions/questions_controller'))
  fastify.register(require('../../../services/api/spotify/spotify_authorization_controller'))
  fastify.register(require('../../../services/api/spotify/spotify_controller'))
  fastify.register(require('./general/application_controller'))
  fastify.register(require('./friends/friends_controller'))
  fastify.register(require('./search/search_controller'))
  fastify.register(require('./devices/devices_controller'))
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
