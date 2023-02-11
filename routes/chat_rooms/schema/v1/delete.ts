import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';
export const deleteChatRoomParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the chat room.' },
  },
  required: ['id'],
} as const;

export const deleteChatRoomSchema = {
  description: 'Delete a chat room',
  tags: ['Chat Rooms'],
  summary: 'Delete a chat room',
  params: deleteChatRoomParams,
  headers: authHeaders,
  response: {
    200: {
      description: 'The request was successful.',
      type: 'null',
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

export type DeleteChatRoomParams = FromSchema<typeof deleteChatRoomParams>;
