const search = {
  description: 'Return an array of users',
  tags: ['Search'],
  summary: 'Returns a list of users',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', description: 'The max number of records to return' },
      offset: { type: 'integer', description: 'The number of records to skip before retrieval' },
      query: { type: 'string', description: 'The query to search against' },
    },
    required: ['limit', 'offset', 'query'],
  },
  response: {
    200: {
      description: 'The request was successful.',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1 },
          uuid: { type: 'string' },
          display_name: { type: 'string' },
          username: { type: 'string' },
          created_at: { type: 'string' },
          updated_at: { type: 'string' },
          avatar_url: { type: 'string' },
          friendship_status: {
            type: 'string',
            enum: ['none', 'friends', 'pending_sent', 'pending_received'],
          },
        },
        required: ['id', 'uuid', 'username', 'display_name'],
      },
    },
    404: {
      description: 'Not Found',
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

const searchV2 = {
  ...search,
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', description: 'The max number of records to return' },
      lastId: { type: 'integer', description: 'Last user ID retreived from backend' },
      lastScore: { type: 'integer', description: 'Number of last score retreived from backend' },
      query: { type: 'string', description: 'The query to search against' },
    },
    required: ['limit', 'query'],
  },
  response: {
    ...search.response,
    200: {
      ...search.response[200],
      items: {
        ...search.response[200].items,
        properties: {
          ...search.response[200].items.properties,
          score: { type: 'string' },
        },
      },
    },
  },
};

module.exports = {
  search,
  searchV2,
};
