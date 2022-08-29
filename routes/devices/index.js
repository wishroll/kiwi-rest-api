module.exports = async (fastify, _options) => {
  const create = require('./schema/v1/create');
  fastify.post(
    '/v1/devices',
    { onRequest: [fastify.authenticate], schema: create },
    async (req, res) => {
      const userId = req.user.id;
      const token = req.body.token;
      const os = req.body.os;
      try {
        const results = await fastify
          .writeDb('devices')
          .insert({ user_id: userId, token, os }, ['id'])
          .onConflict(['user_id', 'token'])
          .ignore();
        if (results) {
          res.status(200).send();
        } else {
          res.status(400).send();
        }
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );
};
