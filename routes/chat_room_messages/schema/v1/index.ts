import { FromSchema } from 'json-schema-to-ts';

export const chatRoomMessagesIndex = {
  description: 'Return a list of chat room messages in a given chat room',
  tags: ['Chat Room Messages'],
  summary: 'Returns an array of chat room messages in a given chat room',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  response: {
    200: {
      desription: 'The request was successful',
      type: 'array',
      properties: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1, description: 'The primary key id of the message' },
          uuid: { type: 'string', description: 'The unique alphanumeric id of the message' },
          created_at: { type: 'string', description: 'The datetime when the message was created' },
          updated_at: {
            type: 'string',
            description: 'The last timestamp when the message was updated',
          },
          sender: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                minimum: 1,
                description: 'The id of the user who created the message',
              },
              uuid: { type: 'string' },
              display_name: { type: 'string' },
              username: { type: 'string' },
              avatar_url: { type: 'string' },
            },
          },
          text: { type: 'string' },
        },
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
