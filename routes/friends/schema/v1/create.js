const friendship = {
  description: 'Create a new friendship',
  tags: ['Relationships'],
  summary: 'Create a new friendship',
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
      requesting_user_id: { type: 'integer', description: 'The id of the requesting user' },
    },
    required: ['requesting_user_id'],
  },
  response: {
    201: {
      description: 'The request was successful.',
      type: 'boolean',
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

const friendshipRequest = {
  description: 'Create a new friend request',
  tags: ['Relationships'],
  summary: 'Create a new friend request',
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
      requested_user_id: { type: 'integer', description: 'The id of the requested user' },
    },
    required: ['requested_user_id'],
  },
  response: {
    201: {
      description: 'The request was successful.',
      type: 'boolean',
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
module.exports = { friendship, friendshipRequest };
