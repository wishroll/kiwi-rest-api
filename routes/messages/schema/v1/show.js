const show = {
  description: 'Return a message',
  tags: ['Messages'],
  summary: 'Return the properties of a message',
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'The id of the message' },
    },
    required: ['id'],
  },
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  response: {
    200: {
      description: 'The request was successful',
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 },
        uuid: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
        sender: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
            uuid: { type: 'string' },
            display_name: { type: 'string' },
            username: { type: 'string' },
            avatar_url: { type: 'string' },
          },
        },
        recipient: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              minimum: 1,
              description: 'The id of the user who created the message',
            },
            uuid: { type: 'string' },
            display_name: { type: 'string' },
            username: { type: 'string' },
            avatar_url: { type: 'string' },
          },
        },
        text: { type: 'string' },
        last_sender_id: { type: 'integer' },
        seen: { type: 'boolean' },
        is_rated: { type: 'boolean', description: 'Whether the message has been rated' },
        track: {
          type: 'object',
          properties: {
            track_id: { type: 'string' },
            platform: { type: 'string', enum: ['spotify', 'apple_music'] },
            uri: { type: 'string' },
            external_url: { type: 'string' },
            href: { type: 'string' },
            name: { type: 'string' },
            duration: { type: 'integer' },
            track_number: { type: 'integer' },
            release_date: { type: 'string' },
            isrc: { type: 'string' },
            artists: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  uri: { type: 'string' },
                  href: { type: 'string' },
                },
              },
              required: ['id', 'name', 'href'],
            },
            explicit: { type: ['boolean'] },
            artwork: {
              type: 'object',
              properties: {
                width: { type: 'integer' },
                height: { type: 'integer' },
                url: { type: 'string' },
              },
              required: ['url'],
            },
          },
        },
        rating: {
          type: 'object',
          properties: {
            score: { type: 'number', minimum: 0.0 },
          },
        },
      },
      required: ['id', 'uuid', 'created_at', 'updated_at'],
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
module.exports = { show };
