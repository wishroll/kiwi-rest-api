const fastify = require('fastify')({
  logger: true,
  maxParamLength: 1000
})
fastify.register(require('@fastify/swagger'), {
  routePrefix: '/documentation',
  exposeRoute: true,
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
      { name: 'Users', description: "Get a users properties, update a user's properties" },
      { name: 'Conversations', description: "Get a user's conversations, Get the contents of a conversation, Create a new conversation" },
      { name: 'Relationships', description: "Create a friend request, return all of a user's friends, create friendships between users" },
      { name: 'Registration', description: 'Sign up' },
      { name: 'Device', description: 'User devices' },
      { name: 'Search', description: 'Searching' },
      { name: 'Messages', description: 'Get a specific message, Get a list of messages, create a new message, destroy a message' }
    ]
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
  transformStaticCSP: (header) => header
})
fastify.ready(err => {
  if (err) throw err
  fastify.swagger()
})
fastify.register(require('./api/routes/index'))
fastify.listen(process.env.PORT, '0.0.0.0', (err, add) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${add}`)
})
