import { buildJsonSchemas } from 'fastify-zod';
import * as zod from 'zod';

export const searchUserQueryStringSchema = zod.object({
  query: zod.string(),
  limit: zod.number(),
  offset: zod.number(),
});

export const searchUserResponseSchema = zod.object({});

export type SearchUserQueryString = zod.TypeOf<typeof searchUserQueryStringSchema>;

export const { schemas: searchSchemas, $ref } = buildJsonSchemas(
  { searchUserQueryStringSchema, searchUserResponseSchema },
  { $id: 'SearchSchema' },
);
