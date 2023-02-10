import { FromSchema } from 'json-schema-to-ts';
export const indexChatRoomMembers = {
  description: 'Return a list of chat room members',
  tags: ['Chat Room Members'],
  summary: 'Returns an array of chat room members',
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
        type: 'array',
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
