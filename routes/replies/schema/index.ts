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

export const repliesSentQuerystring = {
  type: 'object',
  properties: {
    limit: { type: 'integer', description: 'The max number of records to return' },
    lastId: { type: 'integer', description: 'Last reply ID retreived from backend' },
  },
  required: ['limit'],
} as const;

export const repliesSentSchema = {
  description: 'Receives replies to recommendation message.',
  tags: ['messages', 'replies'],
  headers: authHeaders,
  params: repliesSentParams,
  querystring: repliesSentQuerystring,
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

export const markAsSeenParams = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the recommendation message' },
  },
  required: ['id'],
} as const;

export const markAsSeenSchema = {
  description: 'Update status of seen message.',
  tags: ['messages', 'replies'],
  headers: authHeaders,
  params: markAsSeenParams,
};

export type RepliesSentParams = FromSchema<typeof repliesSentParams>;
export type RepliesSentQuerystring = FromSchema<typeof repliesSentQuerystring>;

export type CreateReplyBodyParams = FromSchema<typeof createReplyBody>;
export type CreateReplyBodyBody = FromSchema<typeof createReplyBody>;

export type MarkAsSeenParams = FromSchema<typeof markAsSeenParams>;
