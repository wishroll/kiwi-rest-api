import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';
export const createEmojiReactionBody = {
  type: 'object',
  properties: {
    type: { type: 'string', description: 'The type of object being reacted to.' },
    id: { type: 'integer', description: 'The id of the object being reacted to.' },
    emoji: { type: 'string', description: 'The emoji string used as the reaction' },
  },
  required: ['emoji', 'id', 'type'],
} as const;

export const createEmojiReactionSchema = {
  description: 'Create a new emoji reaction',
  tags: ['Emoji Reactions'],
  summary: 'Create a new emoji reaction',
  headers: authHeaders,
  body: createEmojiReactionBody,
  response: {
    201: {
      description: 'The request was successful.',
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
};

export type CreateEmojiReactionBody = FromSchema<typeof createEmojiReactionBody>;
