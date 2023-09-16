import * as zod from 'zod';

export const userSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  display_name: zod.string().optional().nullable(),
  email: zod.string().optional().nullable(),
  phone_number: zod.string().optional().nullable(),
  created_at: zod.date(),
  updated_at: zod.date(),
  avatar_url: zod.string().optional().nullable(),
  username: zod.string().optional().nullable(),
  share_link: zod.string().optional().nullable(),
  bio: zod.string().optional().nullable(),
  location: zod.string().optional().nullable(),
  display_name_updated_at: zod.date().nullable(),
  username_updated_at: zod.date().nullable(),
});

export const usersSchema = zod.array(userSchema);

export type User = zod.TypeOf<typeof userSchema>;
export type Users = zod.TypeOf<typeof usersSchema>;
