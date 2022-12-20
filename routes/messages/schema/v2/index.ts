import { FromSchema } from 'json-schema-to-ts';
import { STREAMING_PLATFORMS } from '../../../../utils/const';

export const receivedMessagesQuery = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1 },
    lastId: { type: 'integer', description: 'Id of last message in previous iteration' },
    from: { type: 'string', description: 'The id of user used to filter received messages' },
    likedOnly: {
      type: 'boolean',
      description: 'Determines to respond only with messages that has been liked',
    },
  },
  required: ['limit'],
} as const;

export const receivedMessagesIndex = {
  description: 'Return a list of song messages that have been sent to the current user.',
  tags: ['Messages'],
  summary: "Returns an array of a user's receieved song messages",
  query: receivedMessagesQuery,
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
        required: ['id', 'uuid', 'created_at', 'updated_at', 'text', 'is_rated'],
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

export const sentTracksIndex = {
  description: 'Return a list of song messages that have been sent by a user',
  tags: ['Messages'],
  summary: "Returns an array of a user's sent song messages",
  query: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1 },
      lastId: { type: 'integer', description: 'Id of last message in previous iteration' },
    },
    required: ['limit'],
  },
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'The id of the user' },
    },
    required: ['id'],
  },
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
          id: {
            type: 'integer',
            description: 'Id of the message related to this track',
          },
          track: {
            type: 'object',
            properties: {
              message_id: { type: 'string' },
              track_id: { type: 'string' },
              platform: { type: 'string', enum: STREAMING_PLATFORMS },
              uri: { type: 'string' },
              external_url: { type: 'string' },
              href: { type: 'string' },
              name: { type: 'string' },
              duration: { type: 'integer' },
              track_number: { type: 'integer' },
              release_date: { type: 'string' },
              preview_url: { type: 'string', nullable: true },
              isrc: { type: 'string' },
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
              id: { type: 'integer' },
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

export const receivedNewMessagesQuery = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1 },
    lastId: { type: 'integer', description: 'Id of last message in previous iteration' },
  },
  required: ['limit'],
} as const;

export const receivedNewMessagesIndex = {
  description: 'Return a list of song messages that have not been rated yet.',
  tags: ['Messages', 'new'],
  summary: "Returns an array of a user's receieved song messages without score",
  query: receivedNewMessagesQuery,
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
          id: { type: 'integer', minimum: 1, description: 'The primary key id of the message' },
          uuid: { type: 'string', description: 'The unique alphanumeric id of the message' },
          created_at: { type: 'string', description: 'The datetime when the message was created' },
          updated_at: {
            type: 'string',
            description: 'The last timestamp when the message was updated',
          },
          text: { type: 'string' },
          last_sender_id: { type: 'integer' },
          seen: { type: 'boolean' },
          ratings_id: { type: 'integer', nullable: true },
          like: { type: 'boolean', nullable: true },
          score: { type: 'number', nullable: true },
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
        },
        required: ['id', 'uuid', 'created_at', 'updated_at', 'text'],
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

export type NewSongsQuery = FromSchema<typeof receivedNewMessagesQuery>;
export type ReceivedMessagesQuery = FromSchema<typeof receivedMessagesQuery>;
