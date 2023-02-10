import { FromSchema } from 'json-schema-to-ts';

const chatRoomsIndexQuery = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1 },
    lastId: { type: 'integer', description: 'Id of the last chat room in previous page' },
  },
  required: ['limit'],
} as const;

const chatRoomsIndex = {
  description: 'Return a list of chat rooms that the current user belongs to',
  tags: ['Chat Rooms'],
  summary: 'Returns an array of chat rooms that the current user belongs to',
  query: chatRoomsIndexQuery,
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  response: {
    200: {
      description: 'The request was successful',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1, description: 'The primary key id of the chat room' },
          uuid: { type: 'string', description: 'The unique alphanumeric id of the chat room' },
          created_at: { type: 'string', description: 'The datetime when the chatroom was created' },
          updated_at: {
            type: 'string',
            description: 'The last datetime when the chat room was updated at',
          },
          num_users: { type: 'integer', description: 'The number of users in the chat room' },
          num_messages: { type: 'integer', description: 'The number of messages in the chat room' },
          users: {
            type: 'array',
            items: {
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
          },
          last_message: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                minimum: 1,
                description: 'The primary key id of the chat message',
              },
              uuid: {
                type: 'string',
                description: 'The unique alphanumeric id of the chat message',
              },
              text: { type: 'string', description: 'The text value of the message' },
              created_at: {
                type: 'string',
                description: 'The datetime when the message was created',
              },
              updated_at: {
                type: 'string',
                description: 'The last datetime when the message was updated at',
              },
              chat_room_id: {
                type: 'string',
                description: 'The primary key id of the chat room this message was sent to',
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
            },
          },
        },
      },
    },
  },
};

export type ChatRoomsIndexQuery = FromSchema<typeof chatRoomsIndexQuery>;
export { chatRoomsIndex };
