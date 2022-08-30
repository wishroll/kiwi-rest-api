module.exports = {
  description: 'Return the properties of a user',
  tags: ['Users'],
  summary: 'Return the properties of a user',
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'The id of the user' },
    },
    required: ['id'],
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
      type: 'object',
      properties: {
        id: { type: 'integer' },
        uuid: { type: 'string' },
        display_name: { type: 'string' },
        username: { type: 'string' },
        avatar_url: { type: 'string' },
        created_at: { type: 'string' },
        rating: {
          type: 'object',
          properties: {
            score: { type: 'number', minimum: 0.0 },
            hex_code: {
              type: 'string',
              description: "The hex value mapping to and representing the user's score",
            },
          },
        },
      },
      required: ['id', 'uuid', 'display_name', 'username', 'avatar_url'],
    },
    404: {
      description: 'Not found',
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
