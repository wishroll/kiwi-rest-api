import * as zod from 'zod';

export const chatRoomMemberSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  user_id: zod.coerce.bigint(),
  chat_room_id: zod.coerce.bigint(),
  created_at: zod.coerce.date(),
  updated_at: zod.coerce.date(),
});

export const chatRoomMembersSchema = zod.array(chatRoomMemberSchema);

export type ChatRoom = zod.TypeOf<typeof chatRoomMemberSchema>;
export type ChatRooms = zod.TypeOf<typeof chatRoomMembersSchema>;
