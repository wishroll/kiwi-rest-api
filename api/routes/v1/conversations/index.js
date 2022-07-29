const routes = async (fastify, options) => {
  const { index } = require('./schema')
  const {show} = require('./schema/show')
  fastify.get('/conversations', {onRequest: [fastify.authenticate], schema: index },  async (req, res) => {
    const limit = req.query.limit || 10
    const offset = req.query.offset
    const userId = req.user.id
    const conversations = await fastify.knex('conversations')
      .limit(limit)
      .offset(offset)
      .orderBy('conversations.updated_at', 'desc')
    if (conversations.length > 0) {
      res.status(200).send(conversations)
    } else {
      res.status(404).send()
    }
  })

  fastify.get('/conversations/:id', { onRequest: [fastify.authenticate], schema: show }, async (req, res) => {
    const id = req.params.id
    const userId = req.user.id
    
  })

}

module.exports = routes
