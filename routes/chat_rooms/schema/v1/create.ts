const body = {
    type: 'object',
    properties: {
        
    }
} as const;

const createChatRoomSchema = {
  description: 'Create a new chat room',
  tags: ['Chat Rooms'],
  summary: 'Create a new chat room',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string', description: 'The token used for authentication' },
    },
    required: ['Authorization'],
  },
  body: body,
  response: {
    201: {
      description: 'The request was successful.',
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'The primary key id of the chat room' },
        uuid: { type: 'string', description: 'The alphanumeric id of the chat room' },

      },
    },
  },
};
