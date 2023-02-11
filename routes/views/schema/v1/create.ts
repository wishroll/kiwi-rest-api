import { FromSchema } from 'json-schema-to-ts';
import { authHeaders } from '../../../replies/schema';

export const createViewBody = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'The id of the object being viewed' },
    type: { type: 'string', description: 'The type of the object being viewed' },
  },
} as const;

export const createViewSchema = {
  description: 'Create a view on an object',
  tags: ['Views'],
  summary: 'Create a view on an object',
  headers: authHeaders,
  response: {
    201: {
      description: 'The request was successful.',
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

export type CreateViewBody = FromSchema<typeof createViewBody>;
