import { FromSchema } from 'json-schema-to-ts';

export const callbackQuery = {
  type: 'object',
  properties: {
    auth_token: {
      type: 'string',
      description: 'Auth token returned by deezer service',
    },
  },
  required: ['auth_token'],
} as const;

export const callbackSchema = {
  description: 'Callback redirect needed for deezer service',
  tags: ['deezer', 'authorization', 'token'],
  query: callbackQuery,
};

export type CallbackQuery = FromSchema<typeof callbackQuery>;
