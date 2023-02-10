import * as zod from 'zod';

export const chatRoomMessageSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  created_at: zod.coerce.date(),
  updated_at: zod.coerce.date(),
  chat_room_id: zod.coerce.bigint(),
  text: zod.string(),
  sender_id: zod.coerce.bigint(),
  type: zod.coerce.string(),
  song_message_id: zod.coerce.bigint(),
});

export const chatRoomMessagesSchema = zod.array(chatRoomMessageSchema);
export type ChatRoomMessage = zod.TypeOf<typeof chatRoomMessageSchema>;
export type ChatRoomMessages = zod.TypeOf<typeof chatRoomMessagesSchema>;
