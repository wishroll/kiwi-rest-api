module.exports = async (fastify, options) => {
  const index = require('./schema/v1/users/index')
  const { searchUsers } = require('../../services/api/neo4j/search/index')
  fastify.get('/search/users', { onRequest: [fastify.authenticate], schema: index }, async (req, res) => {
    const currentUserId = req.user.id
    const query = req.query.query
    const limit = req.query.limit
    const offset = req.query.offset
    try {
      const users = await searchUsers(query, offset, limit)
      if (users && users.length > 0) {
        res.status(200).send(users)
      } else {
        res.status(404).send({error: true, message: "Not found"})
      }
    } catch (error) {
      console.log(error)
      res.status(500).send({ error })
    }
  })
}
