import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';

export const updateChatRoomMessageBody = {
  type: 'object',
  properties: {
    text: { type: 'string', description: 'The text of the message' },
  },
} as const;

export const updateChatRoomMessageParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the chat room message' },
  },
  required: ['id'],
} as const;

export const updateChatRoomMessageSchema = {
  description: 'Update a chat room message',
  tags: ['Chat Room Messages'],
  summary: 'Update a chat room message',
  body: updateChatRoomMessageBody,
  headers: authHeaders,
  response: {
    200: {
      description: 'The request was successful.',
      type: 'object',
      properties: {},
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

export type UpdateChatRoomMessageBody = FromSchema<typeof updateChatRoomMessageBody>;
export type UpdateChatRoomMessageParams = FromSchema<typeof updateChatRoomMessageParams>;
