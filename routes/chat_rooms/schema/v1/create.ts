import { authHeaders } from "../../../replies/schema";

export const createChatRoomSchema = {
  description: 'Create a new chat room',
  tags: ['Chat Rooms'],
  summary: 'Create a new chat room',
  headers: authHeaders,
  response: {
    201: {
      description: 'The request was successful.',
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'The primary key id of the chat room' },
        uuid: { type: 'string', description: 'The alphanumeric id of the chat room' },
      },
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
