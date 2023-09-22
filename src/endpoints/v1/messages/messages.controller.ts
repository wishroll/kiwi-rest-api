import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createMessageHandler, getMessagesHandler } from './messages.handler';
import { $ref, CreateMessageBody } from './messages.schema';

const messages: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('', {onRequest: [fastify.authenticate]}, getMessagesHandler);
  fastify.post<{ Body: CreateMessageBody }>(
    '',
    { onRequest: [fastify.authenticate], schema: { body: $ref('createMessageBodySchema') } },
    createMessageHandler,
  );
};

export default messages;
