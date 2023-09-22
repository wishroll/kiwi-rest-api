import * as zod from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

export const getUserSchemaParams = zod.object({
  id: zod.string(),
});

export const getUserResponseSchema = zod.object({
  id: zod.string(),
  display_name: zod.string().optional(),
  username: zod.string().optional(),
  bio: zod.string().optional(),
});

export type GetUserParam = zod.TypeOf<typeof getUserSchemaParams>;
export type GetUserResponse = zod.TypeOf<typeof getUserResponseSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas(
  { getUserSchemaParams, getUserResponseSchema },
  { $id: 'UserSchema' },
);