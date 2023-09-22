import * as zod from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

export const updateProfileBodySchema = zod.object({
  display_name: zod.string().optional(),
  username: zod.string().optional(),
});

export type UpdateProfileBody = zod.TypeOf<typeof updateProfileBodySchema>;
export const { schemas: profileSchemas, $ref } = buildJsonSchemas(
  { updateProfileBodySchema },
  { $id: 'ProfileSchemas' },
);
