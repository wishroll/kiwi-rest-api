import { FromSchema } from 'json-schema-to-ts';

export const authHeaders = {
  type: 'object',
  properties: {
    Authorization: { type: 'string', description: 'The token used for authentication' },
  },
  required: ['Authorization'],
};

export const repliesSentParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the recommendation message' },
  },
  required: ['id'],
} as const;

export const repliesSentSchema = {
  description: 'Receives replies to recommendation message.',
  tags: ['messages', 'replies'],
  headers: authHeaders,
  params: repliesSentParams,
};

export const createReplyParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the recommendation message' },
  },
  required: ['id'],
} as const;

export const createReplyBody = {
  type: 'object',
  properties: {
    recipient_id: { type: 'string', description: 'The id of user' },
    text: { type: 'string' },
  },
  required: ['recipient_id', 'text'],
} as const;

export const createReplyBodySchema = {
  description: 'Sends a reply to recommendation message.',
  tags: ['messages', 'replies'],
  headers: authHeaders,
  params: createReplyParams,
  body: createReplyBody,
};

export const updateReplyParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the recommendation message' },
    reply_id: { type: 'integer', description: 'The id of the reply message' },
  },
  required: ['id', 'reply_id'],
} as const;

export const updateReplyBody = {
  type: 'object',
  properties: {
    seen: { type: 'boolean', description: 'Is message viewed' },
  },
  required: ['seen'],
} as const;

export const updateReplySchema = {
  description: 'Update status of seen message.',
  tags: ['messages', 'replies'],
  headers: authHeaders,
  params: updateReplyParams,
  body: updateReplyBody,
};

export type RepliesSentParams = FromSchema<typeof repliesSentParams>;

export type CreateReplyBodyParams = FromSchema<typeof createReplyBody>;
export type CreateReplyBodyBody = FromSchema<typeof createReplyBody>;

export type UpdateReplyParams = FromSchema<typeof updateReplyParams>;
export type UpdateReplyBody = FromSchema<typeof updateReplyBody>;
