import { FromSchema } from 'json-schema-to-ts'; 
import { authHeaders } from '../../../replies/schema';
export const indexEmojiReactionsQueryString = {
  type: 'object',
  properties: {
    limit: {
      type: 'integer',
      description: 'The max number of emoji reactions to return',
      minimum: 1,
    },
    lastId: {
      type: 'integer',
      description: 'The id of the last emoji reaction in the previous response',
    },
    type: {
      type: 'string',
      description: 'The type of the object being reacted to.',
    },
    id: {
      type: 'integer',
      description: 'The foreign key id of the object being reacted to.',
    },
  },
  required: ['limit', 'type', 'id'],
} as const;

export const indexEmojiReactionsSchema = {
  description: 'Return a list of all emoji reactions.',
  tags: ['Emoji Reactions'],
  summary: 'Return a list of all emoji reactions.',
  query: indexEmojiReactionsQueryString,
  headers: authHeaders,
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'The id of the emoji reaction' },
          uuid: { type: 'string', description: 'The alphanumeric id of the emoji reaction' },
          emoji: { type: 'string', description: 'The emoji text' },
          created_at: {
            type: 'string',
            description: 'The datetime the emoji reaction was created.',
          },
          updated_at: {
            type: 'string',
            description: 'The datetime the emoji reaction was updated at.',
          },
          user: {
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
            description: 'The user who created the emoji reaction.',
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

export type IndexEmojiReactionsQueryString = FromSchema<typeof indexEmojiReactionsQueryString>;
