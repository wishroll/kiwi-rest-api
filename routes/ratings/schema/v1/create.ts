export default {
  description: 'Create a new Rating',
  tags: ['Ratings'],
  summary: 'Create a new rating',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  params: {
    type: 'object',
    properties: {
      message_id: { type: 'integer', description: 'The id of the message' },
    },
    required: ['message_id'],
  },
  body: {
    type: 'object',
    properties: {
      score: {
        type: 'number',
        minimum: 0.0,
        description: 'The value of the rating: between 0.00 and 1.00',
      },
    },
    required: ['score'],
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
