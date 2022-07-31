const index = {
  description: 'Return a list of messages',
  tags: ['Messages'],
  summary: "Returns a list a conversations's messages",
  params: {
    type: 'object',
    properties: {
      conversation_id: { type: 'integer', description: 'The id of the converation' }
    },
    required: ['conversation_id']
  },
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' }
    },
    required: ['Authorization']
  },
  response: {
    200: {
      description: 'The request was successful',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1 },
          uuid: { type: 'string' },
          created_at: { type: 'string' },
          updated_at: { type: 'string' },
          text: { type: 'string' }
        },
        required: ['id', 'uuid', 'created_at', 'updated_at', 'text']
      }
    },
    404: {
      description: 'Not found',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    500: {
      description: 'Internal Server Error',
      type: 'object',
      properties: {
        error: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
}

module.exports = { index }
