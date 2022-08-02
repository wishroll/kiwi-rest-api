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
    
    res.status(200).send()
  })
}
