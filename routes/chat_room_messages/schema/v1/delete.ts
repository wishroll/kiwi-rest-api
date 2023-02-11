import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';

export const deleteChatRoomMessageParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the chat room message to delete.' },
  },
  required: ['id'],
} as const;

export const deleteChatRoomMessageSchema = {
  description: 'Delete a chat room message',
  tags: ['Chat Room Messages'],
  summary: 'Remove and permanently delete a chat room message',
  headers: authHeaders,
  response: {
    200: {
      description: 'The request was successful.',
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

export type DeleteChatRoomMessageParams = FromSchema<typeof deleteChatRoomMessageParams>;
