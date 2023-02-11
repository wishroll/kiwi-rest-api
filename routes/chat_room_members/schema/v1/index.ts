import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';
export const indexChatRoomMembersParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the chat room' },
  },
} as const;

export const indexChatRoomMembersQueryString = {
  type: 'object',
  properties: {
    limit: { type: 'integer', description: 'The max number of chat room members to return' },
    lastId: {
      type: 'integer',
      description: 'The id of the last chat room member in the previous response.',
    },
  },
} as const;

export const indexChatRoomMembersSchema = {
  description: 'Return a list of chat room members',
  tags: ['Chat Room Members'],
  summary: 'Returns an array of chat room members',
  params: indexChatRoomMembersParams,
  query: indexChatRoomMembersQueryString,
  headers: authHeaders,
  response: {
    200: {
      description: 'The request was successful.',
      type: 'array',
      items: {
        type: 'array',
        properties: {
          id: { type: 'integer', description: 'The id of the chat room member' },
          uuid: { type: 'string', description: 'The alphanumeric id of the chat room member' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer', description: 'The id of the user' },
              uuid: { type: 'integer', description: 'The alphanumeric id of the user' },
              display_name: { type: 'string' },
              username: { type: 'string' },
              avatar_url: { type: 'string' },
            },
          },
          created_at: { type: 'string', description: 'The datetime when the message was created' },
          updated_at: {
            type: 'string',
            description: 'The last timestamp when the message was updated',
          },
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

export type IndexChatRoomMembersParams = FromSchema<typeof indexChatRoomMembersParams>;
export type IndexChatRoomMembersQueryString = FromSchema<typeof indexChatRoomMembersQueryString>;
