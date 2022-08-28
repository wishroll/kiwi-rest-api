module.exports = async (fastify, options) => {
  const index = require('./schema/v1/users/index')
  const { searchUsers } = require('../../services/api/neo4j/search/index')
  fastify.get('/search/users', { onRequest: [fastify.authenticate], schema: index }, async (req, res) => {
    const currentUserId = req.user.id
    const query = req.query.query;
    const limit = req.query.limit;
    const offset = req.query.offset;
    if (!query || query.length < 1) {
      return res.status(400).send({ error: true, message: 'Missing Query' });
    }
    try {
      const users = await searchUsers(query, offset, limit);
      res.status(200).send(users);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error });
    }
  })
}
