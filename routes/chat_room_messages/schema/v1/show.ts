import { FromSchema } from 'json-schema-to-ts';

export const chatRoomMessageShow = {
  description: 'Return a chat room message',
  tags: ['Chat Room Messages'],
  summary: 'Return a chat room message',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  response: {
    200: {
      description: 'The request was successful.',
      type: 'array',
      items: {
        type: 'object',
        properties: {},
      },
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
