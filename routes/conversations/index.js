const { default: logger } = require('../../logger');

module.exports = async (fastify, _options) => {
  const index = require('./schema/v1/index');
  const show = require('./schema/v1/show');
  const jsf = require('json-schema-faker');

  fastify.get(
    '/v1/conversations',
    { onRequest: [fastify.authenticate], schema: index },
    async (req, res) => {
      const conversations = jsf.generate(index.response[200]);
      logger(req).debug({ response: index.response[200] });
      res.status(200).send(conversations);
    },
  );

  fastify.get(
    '/v1/conversations/:id',
    { onRequest: [fastify.authenticate], schema: show },
    async (req, res) => {
      logger(req).debug({ response: show.response[200] });
      const conversation = jsf.generate(show.response[200]);
      res.status(200).send(conversation);
    },
  );
};
