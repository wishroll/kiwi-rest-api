import * as zod from 'zod';
import { buildJsonSchemas } from 'fastify-zod';
import { Track } from 'src/models/tracks';

export const getMessagesResponseSchema = zod.object({});
export const createMessageBodySchema = zod.object({
  track: zod.custom<Track>(),
  recipient_ids: zod.array(zod.number()),
  text: zod.string().optional(),
  send_to_all: zod.boolean(),
});

export type GetMessagesResponse = zod.TypeOf<typeof getMessagesResponseSchema>;
export type CreateMessageBody = zod.TypeOf<typeof createMessageBodySchema>;
export const { schemas: messagesSchemas, $ref } = buildJsonSchemas(
  {
    getMessagesResponseSchema,
    createMessageBodySchema,
  },
  { $id: 'MessagesSchema' },
);
