import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { createRelationshipHandler, deleteRelationshipHandler, getRelationshipsHandler, createRelationshipRequestHandler, deleteRelationshipRequestHandler, getRequestedRelationshipsHandler, getRequestingRelationshipsHandler, getRelationshipStatusHandler, getRelationshipSuggestions } from "./relationships.handler";

const relationships: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
    fastify.post('/accept-request', createRelationshipHandler);
    fastify.delete('/', deleteRelationshipHandler);
    fastify.get('/', getRelationshipsHandler);
    fastify.post('/request', createRelationshipRequestHandler);
    fastify.delete('/request', deleteRelationshipRequestHandler);
    fastify.get('/requested', getRequestedRelationshipsHandler);
    fastify.get('/requesting', getRequestingRelationshipsHandler);
    fastify.get('/status', getRelationshipStatusHandler);
    fastify.get('me/suggestions', getRelationshipSuggestions);
};

export default relationships;