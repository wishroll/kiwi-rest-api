import * as zod from 'zod';

export const userSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  display_name: zod.string().optional().nullable(),
  phone_number: zod.string(),
  created_at: zod.string().datetime(),
  updated_at: zod.string().datetime(),
  avatar_url: zod.string().optional().nullable(),
  username: zod.string().optional().nullable(),
  share_link: zod.string().optional().nullable(),
});

export const usersSchema = zod.array(userSchema);

export type User = zod.TypeOf<typeof userSchema>;
export type Users = zod.TypeOf<typeof usersSchema>;
