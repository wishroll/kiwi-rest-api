import { FromSchema } from 'json-schema-to-ts';
import { STREAMING_PLATFORMS } from '../../../../utils/const';
import { authHeaders } from '../../../replies/schema';

export const indexChatRoomsQueryString = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1 },
    lastId: { type: 'integer', description: 'Id of the last chat room in previous page' },
  },
  required: ['limit'],
} as const;

export const indexChatRoomsSchema = {
  description: 'Return a list of chat rooms that the current user belongs to',
  tags: ['Chat Rooms'],
  summary: 'Returns an array of chat rooms that the current user belongs to',
  query: indexChatRoomsQueryString,
  headers: authHeaders,
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
              id: { type: 'integer', description: 'The primary key id of the chat room message' },
              uuid: {
                type: 'integer',
                description: 'The alphanumeric id of the chat room message',
              },
              created_at: {
                type: 'string',
                description: 'The created_at date timestamp when the chat room message was created',
              },
              updated_at: {
                type: 'string',
                description:
                  'The updated at date timestamp when the chat room message was last updated at',
              },
              chat_room_id: { type: 'integer', description: 'The foreign key id of the chat room' },
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
              type: { type: 'string', enum: ['song_message', 'text', 'photo', 'video'] },
              song_message: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    minimum: 1,
                    description: 'The primary key id of the message',
                  },
                  uuid: {
                    type: 'string',
                    description: 'The unique alphanumeric id of the message',
                  },
                  created_at: {
                    type: 'string',
                    description: 'The datetime when the message was created',
                  },
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
                  last_sender_id: { type: 'integer' },
                  seen: { type: 'boolean' },
                  is_rated: { type: 'boolean', description: 'Whether the message has been rated' },
                  track: {
                    type: 'object',
                    properties: {
                      track_id: { type: 'string' },
                      platform: { type: 'string', enum: STREAMING_PLATFORMS },
                      uri: { type: 'string' },
                      external_url: { type: 'string' },
                      href: { type: 'string' },
                      name: { type: 'string' },
                      duration: { type: 'integer' },
                      track_number: { type: 'integer' },
                      release_date: { type: 'string' },
                      isrc: { type: 'string' },
                      preview_url: { type: 'string' },
                      artists: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            uri: { type: 'string' },
                            href: { type: 'string' },
                          },
                        },
                        required: ['id', 'name', 'href'],
                      },
                      explicit: { type: ['boolean'] },
                      artwork: {
                        type: 'object',
                        properties: {
                          width: { type: 'integer' },
                          height: { type: 'integer' },
                          url: { type: 'string' },
                        },
                        required: ['url'],
                      },
                    },
                  },
                  rating: {
                    type: 'object',
                    properties: {
                      like: { type: 'boolean', description: 'Is song liked' },
                      score: { type: 'number', minimum: 0.0, description: 'The score' },
                    },
                  },
                },
                required: ['id', 'uuid', 'created_at', 'updated_at'],
              },
              text: {
                type: 'string',
                description: 'The text associated with the chat room message',
              },
            },
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

export type ChatRoomsIndexQuery = FromSchema<typeof indexChatRoomsQueryString>;
