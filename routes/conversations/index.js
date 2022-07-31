module.exports = async (fastify, options) => {
  const index = require('./schema/v1/index')
  const show = require('./schema/v1/show')
  const jsf = require('json-schema-faker')

  fastify.get('/v1/conversations', { onRequest: [fastify.authenticate], schema: index }, async (req, res) => {
    const limit = req.query.limit || 10
    const offset = req.query.offset
    const userId = req.user.id
    const conversations = jsf.generate(index.response[200])
    console.log(index.response[200])
    res.status(200).send(conversations)
  })

  fastify.get('/v1/conversations/:id', { onRequest: [fastify.authenticate], schema: show }, async (req, res) => {
    const id = req.params.id
    const userId = req.user.id
    console.log(show.response[200])
    const conversation = jsf.generate(show.response[200])
    res.status(200).send(conversation)
  })
}
