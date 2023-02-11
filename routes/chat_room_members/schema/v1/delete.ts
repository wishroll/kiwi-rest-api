import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';
export const deleteChatRoomMemberParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the chat room member' },
  },
  required: ['id'],
} as const;

export const deleteChatRoomMemberSchema = {
  description: 'Delete a chat room member',
  tags: ['Chat Room Members'],
  summary: 'Remove a user from a chat room',
  params: deleteChatRoomMemberParams,
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

export type DeleteChatRoomMemberParams = FromSchema<typeof deleteChatRoomMemberParams>;
