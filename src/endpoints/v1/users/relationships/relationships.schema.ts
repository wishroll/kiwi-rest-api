import { buildJsonSchemas } from 'fastify-zod';
import * as zod from 'zod';

export const createRelationshipBodySchema = zod.object({
  friend_id: zod.number(),
});

export const createRelationshipRequestBodySchema = zod.object({
  requested_user_id: zod.number(),
});

export const deleteRelationshipRequestBodySchema = zod.object({
  requested_user_id: zod.number(),
});

export const getUserRelationshipsQuerySchema = zod.object({
  user_id: zod.number(),
  limit: zod.bigint(),
  offset: zod.bigint(),
});

export const deleteRelationshipBodySchema = zod.object({
  friend_id: zod.number(),
});

export const getRelationshipsQuerySchema = zod.object({
  limit: zod.bigint(),
});

export const getRelationshipStatusQuerystringSchema = zod.object({
  user_id: zod.number(),
});

export const getSuggestedRelationshipUsersQuerystringSchema = zod.object({
  limit: zod.bigint(),
  offset: zod.bigint(),
});

export const getRequestedRelationshipUserQuerystringSchema = zod.object({
  limit: zod.bigint(),
  offset: zod.bigint(),
});

export const getRequestingRelationshipUserQuerystringSchema = zod.object({
  limit: zod.bigint(),
  offset: zod.bigint(),
});

export type CreateRelationshipBody = zod.TypeOf<typeof createRelationshipBodySchema>;
export type CreateRelationshipRequestBody = zod.TypeOf<typeof createRelationshipRequestBodySchema>;
export type DeleteRelationshipRequestBody = zod.TypeOf<typeof deleteRelationshipRequestBodySchema>;
export type GetUserRelationshipQuery = zod.TypeOf<typeof getUserRelationshipsQuerySchema>;
export type DeleteRelationshipBody = zod.TypeOf<typeof deleteRelationshipBodySchema>;
export type GetRelationshipStatusQuerystring = zod.TypeOf<
  typeof getRelationshipStatusQuerystringSchema
>;
export type GetSuggestedRelationshipUsersQuerystring = zod.TypeOf<
  typeof getSuggestedRelationshipUsersQuerystringSchema
>;
export type GetRequestedRelationshipUserQuerystring = zod.TypeOf<
  typeof getRequestedRelationshipUserQuerystringSchema
>;
export type GetRequestingRelationshipUserQuerystring = zod.TypeOf<
  typeof getRequestingRelationshipUserQuerystringSchema
>;

export const { schemas: relationshipSchemas, $ref } = buildJsonSchemas(
  {
    createRelationshipBodySchema,
    createRelationshipRequestBodySchema,
    deleteRelationshipBodySchema,
    getUserRelationshipsQuerySchema,
    deleteRelationshipRequestBodySchema,
    getSuggestedRelationshipUsersQuerystringSchema,
    getRelationshipStatusQuerystringSchema,
    getRequestingRelationshipUserQuerystringSchema,
    getRequestedRelationshipUserQuerystringSchema,
  },
  { $id: 'RelationshipsSchema' },
);
