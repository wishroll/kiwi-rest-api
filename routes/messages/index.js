module.exports = async (fastify, options) => {
  const { index } = require('./schema/v1/index')
  const { show } = require('./schema/v1/show')
  const create = require('./schema/v1/create')
  const jsf = require('json-schema-faker')

  fastify.get('/v1/conversations/:conversation_id/messages', { onRequest: [fastify.authenticate], schema: index }, async (req, res) => {
    const currentUserId = req.user.id
    const messages = jsf.generate(index.response[200])
    res.status(200).send(messages)
  })

  fastify.get('/v1/messages/:id', { onRequest: [fastify.authenticate], schema: show }, async (req, res) => {
    const currentUserId = req.user.id
    const message = jsf.generate(show.response[200])
    res.status(200).send(message)
  })

  fastify.post('/v1/messages', { onRequest: [fastify.authenticate], schema: create }, async (req, res) => {
    const currentUserId = req.user.id
    const recipientIds = req.body.recipient_ids
    const track = req.body.track
    try {
      const recipients = await fastify.knex('users').select('id').whereIn('id', recipientIds)
      if (recipients.length < 1) {
        return res.status(400).send({ error: true, message: `Recipients could not be found for the given ids: ${recipientIds.toString()}` })
      }
      let trackId;
      const existingTrack = await fastify.knex('tracks').select(['id', 'platform']).where({ id: track.id, platform: track.platform }).first()
      if (existingTrack) {
        trackId = existingTrack.id;
      } else {
        const results = await fastify.knex('tracks').insert(track, ['id'])
        if (!results || results.length < 1) {
          return res.status(500).send({ error: true, message: 'Could not create a new track' })
        } else {
          trackId = results[0].id
        }
      }
      
      res.status(200).send()

    } catch (error) {
      res.status(500).send({ error: true, message: error })
    }

  })
}
