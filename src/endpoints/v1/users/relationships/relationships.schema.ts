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
  user_id: zod.string(),
  limit: zod.string(),
  offset: zod.string(),
});

export const deleteRelationshipBodySchema = zod.object({
  friend_id: zod.number(),
});

export const getRelationshipsQuerySchema = zod.object({
  limit: zod.number(),
});

export const getRelationshipStatusQuerystringSchema = zod.object({
  user_id: zod.number(),
});

export const getSuggestedRelationshipUsersQuerystringSchema = zod.object({
  limit: zod.number(),
  offset: zod.number(),
});

export type CreateRelationshipBody = zod.TypeOf<typeof createRelationshipBodySchema>;
export type CreateRelationshipRequestBody = zod.TypeOf<typeof createRelationshipRequestBodySchema>;
export type DeleteRelationshipRequestBody = zod.TypeOf<typeof deleteRelationshipRequestBodySchema>;
export type GetUserRelationshipQuery = zod.TypeOf<typeof getUserRelationshipsQuerySchema>;
export type DeleteRelationshipBody = zod.TypeOf<typeof deleteRelationshipBodySchema>;
export type GetRelationshipStatusQuerystring = zod.TypeOf<
  typeof getRelationshipStatusQuerystringSchema
>;
export type getSuggestedRelationshipUsersQuerystring = zod.TypeOf<
  typeof getSuggestedRelationshipUsersQuerystringSchema
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
  },
  { $id: 'RelationshipsSchema' },
);
