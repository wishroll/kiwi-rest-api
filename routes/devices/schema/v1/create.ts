import { FromSchema } from 'json-schema-to-ts';

const createBody = {
  type: 'object',
  properties: {
    os: { type: 'string', description: 'The os of the device' },
    token: { type: 'string', description: 'The registration token of the device' },
  },
  required: ['token'],
} as const;

export const create = {
  description: 'Create a new device',
  tags: ['Devices'],
  summary: 'Create a new device',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  body: createBody,
  response: {
    201: {
      description: 'The request was successful.',
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 },
        uuid: { type: 'string' },
        token: { type: 'string' },
        user_id: { type: 'string' },
        os: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
      },
      required: ['id', 'uuid', 'user_id', 'os', 'token'],
    },
    400: {
      description: 'Client error',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
    409: {
      description: 'Client Error',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
    500: {
      description: 'Internal Server Error',
      summary: 'A response indicating an error occurred on the server.',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

export type CreateBody = FromSchema<typeof createBody>;
