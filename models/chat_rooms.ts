import * as zod from 'zod';

const ids = zod.coerce.bigint();

export const chatRoomSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  created_at: zod.coerce.date(),
  updated_at: zod.coerce.date(),
  num_users: zod.coerce.bigint(),
  num_messages: zod.coerce.bigint(),
  last_message_id: zod.coerce.bigint(),
  user_ids: zod.array(ids),
});

export const chatRoomsSchema = zod.array(chatRoomSchema);

export type ChatRoom = zod.TypeOf<typeof chatRoomSchema>;
export type ChatRooms = zod.TypeOf<typeof chatRoomsSchema>;
