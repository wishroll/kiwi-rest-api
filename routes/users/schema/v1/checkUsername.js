module.exports = {
  description: 'Return if the username is available',
  tags: ['Users'],
  summary: 'Return if the username is available',
  querystring: {
    type: 'object',
    properties: {
      username: { type: 'string', description: 'The username that the user is trying to add' },
    },
    required: ['username'],
  },
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  response: {
    200: {
      description: 'Username is available',
      type: 'string',
    },
    400: {
      description: 'Username taken',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
    500: {
      description: 'Internal Server Error',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};
