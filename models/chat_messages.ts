import * as zod from 'zod';
export const chatMessageSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  created_at: zod.date(),
  updated_at: zod.date(),
  text: zod.string().nullable().optional(),
  sender_id: zod.coerce.bigint(),
  chat_room_id: zod.coerce.bigint(),
  song_message_id: zod.coerce.bigint().optional().nullable(),
  type: zod.enum(['text', 'song_message']),
});

export const chatMessagesSchema = zod.array(chatMessageSchema);
export type ChatMessage = zod.TypeOf<typeof chatMessageSchema>;
export type ChatMessages = zod.TypeOf<typeof chatMessagesSchema>;
