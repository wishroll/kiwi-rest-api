const fp = require('fastify-plugin')

module.exports = fp(async function(fastify, opts) {
    await fastify.register(require('@fastify/swagger'), {
        routePrefix: '/documentation',
        swagger: {
          info: {
            title: 'Kiwi documentation',
            description: 'Documentation for the kiwi api',
            version: '1.0.1'
          },
          externalDocs: {
            url: 'https://swagger.io',
            description: 'Find more info here'
          },
          host: process.env.HOST,
          schemes: ['http', 'https'],
          consumes: ['application/json'],
          produces: ['application/json'],
          tags: [
            {name: 'user', description: 'user related endpoints'}
          ],
          definitions: {
            User: {
              type: 'object',
              required: ['id', 'uuid', 'phone_number', 'username'],
              properties: {
                id: {type: 'int'},
                uuid: {type: 'string', format: 'uuid'}
              }
            }
          },
          uiConfig: {
            docExpansion: 'full',
            deepLinking: false
          },
          uiHooks: {
            onRequest: function (request, reply, next) { next() },
            preHandler: function (request, reply, next) { next() }
          },
          staticCSP: true,
          transformStaticCSP: (header) => header,
          exposeRoute: true
        }
      })
})