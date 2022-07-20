const routes = async (fastify, options) => {
  fastify.get('/search/users', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const userId = req.user.id
    const query = req.query.query
    const limit = req.query.limit
    const offset = req.query.offset
    if (!query || query.length < 1) {
      return res.status(400).send({ message: 'Missing query' })
    }
    try {
      const users = await fastify.knex('users').whereILike('username', `%${query}%`).limit(limit).offset(offset)
      if (users.length > 0) {
        res.status(200).send(users)
      } else {
        res.status(404).send({ message: 'Not found' })
      }
    } catch (error) {
      res.status(500).send({ error })
    }
  })
}
module.exports = routes
