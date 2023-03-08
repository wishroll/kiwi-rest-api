module.exports = {
  description: 'Safe-Deleted user with setting is_deleted property',
  summary: 'Return the properties of a user',
  tags: ['Users', 'Delete'],
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  response: {
    204: {
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
      required: ['error', 'message'],
    },
  },
  500: {
    description: 'Internal Server Error',
    type: 'object',
    properties: {
      error: { type: 'boolean' },
      message: { type: 'string' },
    },
    required: ['error', 'message'],
  },
};
