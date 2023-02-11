import { STREAMING_PLATFORMS } from '../../../../utils/const';
import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';

export const indexChatRoomMessagesQueryString = {
  type: 'object',
  properties: {
    limit: {
      type: 'integer',
      description: 'The maximum number of chat room messages to return',
      minmum: 1,
    },
    lastId: { type: 'integer', description: 'The id of the last message in the previous response' },
  },
  required: ['limit'],
} as const;

export const indexChatRoomMessagesParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the chat room the message belongs to.' },
  },
  required: ['id'],
} as const;

export const indexChatRoomMessagesSchema = {
  description: 'Return a list of chat room messages in a given chat room',
  tags: ['Chat Room Messages'],
  summary: 'Returns an array of chat room messages in a given chat room',
  query: indexChatRoomMessagesQueryString,
  params: indexChatRoomMessagesParams,
  headers: authHeaders,
  response: {
    200: {
      description: 'The request was successful.',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'The primary key id of the chat room message' },
          uuid: { type: 'integer', description: 'The alphanumeric id of the chat room message' },
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
              id: { type: 'integer', minimum: 1, description: 'The primary key id of the message' },
              uuid: { type: 'string', description: 'The unique alphanumeric id of the message' },
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
          text: { type: 'string', description: 'The text associated with the chat room message' },
        },
      },
      required: ['id', 'uuid', 'sender', 'created_at', 'updated_at', 'chat_room_id', 'type'],
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

export type IndexChatRoomMessagesQueryString = FromSchema<typeof indexChatRoomMessagesQueryString>;
export type IndexChatRoomMessagesParams = FromSchema<typeof indexChatRoomMessagesParams>;
