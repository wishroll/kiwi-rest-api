import { buildJsonSchemas } from 'fastify-zod';
import * as zod from 'zod';

export const registerUserSchema = zod.object({
  phone_number: zod.string(),
});

export const signInUserSchema = zod.object({
  phone_number: zod.string(),
});

export type RegisterUser = zod.TypeOf<typeof registerUserSchema>;
export type SignInUserSchema = zod.TypeOf<typeof signInUserSchema>;

export const { schemas: authSchemas, $ref } = buildJsonSchemas(
  { registerUserSchema, signInUserSchema },
  { $id: 'AuthSchemas' },
);
