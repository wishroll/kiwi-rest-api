import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  createRelationshipHandler,
  deleteRelationshipHandler,
  getRelationshipsHandler,
  createRelationshipRequestHandler,
  deleteRelationshipRequestHandler,
  getRequestedRelationshipsHandler,
  getRequestingRelationshipsHandler,
  getRelationshipStatusHandler,
  getRelationshipSuggestions,
} from './relationships.handler';
import {
  $ref,
  CreateRelationshipBody,
  CreateRelationshipRequestBody,
  DeleteRelationshipBody,
  DeleteRelationshipRequestBody,
  GetRelationshipStatusQuerystring,
  GetRequestedRelationshipUserQuerystring,
  GetRequestingRelationshipUserQuerystring,
  GetSuggestedRelationshipUsersQuerystring,
  GetUserRelationshipQuery,
} from './relationships.schema';

const relationships: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.post<{ Body: CreateRelationshipBody }>(
    '/accept-request',
    { onRequest: fastify.authenticate, schema: { body: $ref('createRelationshipBodySchema') } },
    createRelationshipHandler,
  );
  fastify.delete<{ Body: DeleteRelationshipBody }>(
    '/',
    { onRequest: fastify.authenticate, schema: { body: $ref('deleteRelationshipBodySchema') } },
    deleteRelationshipHandler,
  );
  fastify.get<{ Querystring: GetUserRelationshipQuery }>(
    '/',
    {
      onRequest: fastify.authenticate,
      schema: { querystring: $ref('getUserRelationshipsQuerySchema') },
    },
    getRelationshipsHandler,
  );
  fastify.post<{ Body: CreateRelationshipRequestBody }>(
    '/request',
    {
      onRequest: fastify.authenticate,
      schema: { body: $ref('createRelationshipRequestBodySchema') },
    },
    createRelationshipRequestHandler,
  );
  fastify.delete<{ Body: DeleteRelationshipRequestBody }>(
    '/request',
    {
      onRequest: fastify.authenticate,
      schema: { body: $ref('deleteRelationshipRequestBodySchema') },
    },
    deleteRelationshipRequestHandler,
  );
  fastify.get<{ Querystring: GetRequestedRelationshipUserQuerystring }>(
    '/requested',
    {
      onRequest: fastify.authenticate,
      schema: { querystring: $ref('getRequestedRelationshipUserQuerystringSchema') },
    },
    getRequestedRelationshipsHandler,
  );
  fastify.get<{ Querystring: GetRequestingRelationshipUserQuerystring }>(
    '/requesting',
    {
      onRequest: fastify.authenticate,
      schema: { querystring: $ref('getRequestingRelationshipUserQuerystringSchema') },
    },
    getRequestingRelationshipsHandler,
  );
  fastify.get<{ Querystring: GetRelationshipStatusQuerystring }>(
    '/status',
    {
      onRequest: fastify.authenticate,
      schema: { querystring: $ref('getRelationshipStatusQuerystringSchema') },
    },
    getRelationshipStatusHandler,
  );
  fastify.get<{ Querystring: GetSuggestedRelationshipUsersQuerystring }>(
    '/suggestions',
    {
      onRequest: fastify.authenticate,
      schema: { querystring: $ref('getSuggestedRelationshipUsersQuerystringSchema') },
    },
    getRelationshipSuggestions,
  );
};

export default relationships;
