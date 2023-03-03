import { FromSchema } from 'json-schema-to-ts';

const deleteBody = {
  type: 'object',
  properties: {
    token: { type: 'string', description: 'The registration token of the device' },
  },
  required: ['token'],
} as const;

export const delete_ = {
  description: 'Delete an existing device',
  tags: ['Devices'],
  summary: 'Delete an existing device',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  body: deleteBody,
  response: {
    204: {
      description: 'The request was successful and returned a response without content.',
      type: 'object',
    },
    400: {
      description: 'Client error',
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

export type DeleteBody = FromSchema<typeof deleteBody>;
