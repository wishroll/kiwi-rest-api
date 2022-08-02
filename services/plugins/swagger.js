module.exports = {
  routePrefix: '/documentation',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Kiwi documentation',
      description: 'Documentation for the Kiwi API',
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
      { name: 'Sessions', description: 'User Sessions' },
      { name: 'Devices', description: 'Manage User devices, create devices, etc' },
      { name: 'Search', description: 'Search Users' },
      { name: 'Messages', description: 'Get a specific message, Get a list of messages, create a new message, destroy a message' },
      {name: 'Ratings', description: 'Get Ratings for a specific song, create a new rating'}
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
}
