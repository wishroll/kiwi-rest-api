import { FromSchema } from 'json-schema-to-ts';

export const messagesBody = {
  type: 'object',
  properties: {
    recipient_id: { type: 'string', description: 'The id of user' },
    sender_id: { type: 'string', description: 'The id of user' },
    message_id: { type: 'string', description: 'The id of message' },
  },
} as const;

export const messagesTestSchema = {
  description: 'Messages test endpoint',
  tags: ['messages', 'test'],
  body: messagesBody,
};

export type MessagesBody = FromSchema<typeof messagesBody>;
