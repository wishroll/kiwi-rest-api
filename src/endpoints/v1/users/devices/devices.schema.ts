import { buildJsonSchemas } from 'fastify-zod';
import * as zod from 'zod';

export const createDeviceBodySchema = zod.object({
  os: zod.string(),
  token: zod.string(),
});

export const createDeviceResponseSchema = zod.object({
  id: zod.number(),
  uuid: zod.string(),
  token: zod.string(),
  user_id: zod.string(),
  os: zod.string(),
  created_at: zod.string(),
  updated_at: zod.string(),
});

export type CreateDeviceBody = zod.TypeOf<typeof createDeviceBodySchema>;
export type CreateDeviceResponse = zod.TypeOf<typeof createDeviceResponseSchema>;

export const { schemas: devicesSchemas, $ref } = buildJsonSchemas(
  {
    createDeviceBodySchema,
  },
  { $id: 'DevicesSchema' },
);
