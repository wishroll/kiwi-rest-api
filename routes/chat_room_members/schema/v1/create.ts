import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';
export const createChatRoomMembersBody = {
  type: 'object',
  properties: {
    user_ids: {
      type: 'array',
      items: { type: 'integer', description: 'The id of the user' },
      description: 'The ids of users to create chat room members from.',
    },
    chat_room_id: { type: 'integer', description: 'The id of the chat room' },
  },
  required: ['user_ids', 'chat_room_id'],
} as const;

export const createChatRoomMembersParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the chat room.' },
  },
} as const;

export const createChatRoomMembersSchema = {
  description: 'Create a new chat room member',
  tags: ['Chat Room Members'],
  summary: 'Create a new chat room member',
  headers: authHeaders,
  params: createChatRoomMembersParams,
  body: createChatRoomMembersBody,
  response: {
    201: {
      description: 'The request was successful.',
      type: 'object',
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
};

export type CreateChatRoomMembersBody = FromSchema<typeof createChatRoomMembersBody>;
export type CreateChatRoomMembersParams = FromSchema<typeof createChatRoomMembersParams>;
