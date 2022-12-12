import { FromSchema } from 'json-schema-to-ts';

export const rateSongParams = {
  type: 'object',
  properties: {
    message_id: {
      type: 'integer',
      description: 'The id of the message that contains song to rate',
    },
  },
  required: ['message_id'],
} as const;

export const rateSongBody = {
  type: 'object',
  properties: {
    like: { type: 'boolean', description: 'Indicator if user liked a song' },
  },
  required: ['like'],
} as const;

export const rateSongSchema = {
  description: 'Sends a reply to recommendation message.',
  tags: ['messages', 'replies'],
  params: rateSongParams,
  body: rateSongBody,
};

export type RateSongParams = FromSchema<typeof rateSongParams>;
export type RateSongBody = FromSchema<typeof rateSongBody>;
