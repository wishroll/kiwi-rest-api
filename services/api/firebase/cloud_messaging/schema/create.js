module.exports = {
  description: 'Create a new Token or update an existing one',
  summary: 'Create a new Token or update an existing one',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  body: {
    type: 'object',
    properties: {
      token: { type: 'string', description: 'The value of the token' },
    },
    required: ['token'],
  },
  response: {
    201: {
      description: 'The request was successful.',
      type: 'null',
    },
    400: {
      description: 'Client error',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
    409: {
      description: 'Client Error',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
    500: {
      description: 'Internal Server Error',
      summary: 'A response indicating an error occurred on the server.',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};
