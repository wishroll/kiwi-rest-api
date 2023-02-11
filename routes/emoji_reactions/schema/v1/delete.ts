import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';
export const deleteEmojiReactionParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the emoji reaction' },
  },
  required: ['id'],
} as const;

export const deleteEmojiReactionSchema = {
  description: 'Delete an emoji reaction',
  tags: ['Emoji Reactions'],
  summary: 'Delete an emoji reaction',
  params: deleteEmojiReactionParams,
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

export type DeleteEmojiReactionParams = FromSchema<typeof deleteEmojiReactionParams>;
