import { FromSchema } from 'json-schema-to-ts';

export const swapBody = {
  type: 'object',
  properties: {
    code: {
      type: 'string',
      description: 'The code returned from Spotify account service to be used in the token request',
    },
  },
  required: ['code'],
} as const;

export const swapSchema = {
  description: '',
  tags: ['Spotify', 'swap', 'token'],
  body: swapBody,
  response: {
    200: {
      description: 'The request was successful',
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token received from Spotify account service',
        },
        expires_in: {
          type: 'string',
          description:
            'The time period (in seconds) for which the access token is valid. Returned from the Spotify account service',
        },
        refresh_token: {
          type: 'string',
          description: 'The refresh token returned from the Spotify account service',
        },
      },
      required: ['access_token', 'expires_in', 'refresh_token'],
    },
  },
};

export const refreshBody = {
  type: 'object',
  properties: {
    refresh_token: {
      type: 'string',
      description: 'The refresh token returned from the Spotify account service',
    },
  },
  required: ['refresh_token'],
} as const;

export const refreshSchema = {
  description: '',
  tags: ['Spotify', 'refresh', 'token'],
  body: refreshBody,
  response: {
    200: {
      description: 'The request was successful',
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token received from Spotify account service',
        },
        expires_in: {
          type: 'string',
          description:
            'The time period (in seconds) for which the access token is valid. Returned from the Spotify account service',
        },
      },
    },
  },
};

export type SwapBody = FromSchema<typeof swapBody>;
export type RefreshBody = FromSchema<typeof refreshBody>;
