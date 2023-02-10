export default {
  routePrefix: '/documentation',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Kiwi documentation',
      description: 'Documentation for the Kiwi API',
      version: '1.0.1',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    host: process.env.HOST,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      {
        name: 'Chat Rooms',
        description:
          'Get a specific chat room, Get a list of chat rooms, create a new chat room, delete a chat room',
      },
      {
        name: 'Chat Room Users',
        description:
          'Get a list of chat room members, create a new chat room member, leave a chat room (destroy chat room member)',
      },
      {
        name: 'Chat Room Messages',
        description:
          'Get a list of chat room messages, create a new chat room message, delete a chat room message, and update a message',
      },
      {
        name: 'Messages',
        description:
          'Get a specific song message, Get a list of song messages, create a new song message, destroy a song message',
      },
      {
        name: 'Ratings',
        description:
          'Get Ratings for a specific song message, create a new rating for a song message',
      },
      { name: 'Users', description: "Get a users properties, update a user's properties" },
      // { name: 'Conversations', description: "Get a user's conversations, Get the contents of a conversation, Create a new conversation" },
      {
        name: 'Relationships',
        description:
          "Create a friend request, return all of a user's friends, create friendships between users",
      },
      { name: 'Devices', description: 'Manage User devices, create devices, etc' },
      { name: 'Registration', description: 'Sign up' },
      { name: 'Sessions', description: 'User Sessions' },
      { name: 'Search', description: 'Search Users' },
      { name: 'Widgets', description: 'Get data needed for widget display' },
    ],
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
};
