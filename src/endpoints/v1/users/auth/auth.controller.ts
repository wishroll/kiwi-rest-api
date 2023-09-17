import { FastifyPluginAsync } from 'fastify';
import { FastifyInstance } from 'fastify/types/instance';
import { registerUserHandler, signInUserHandler } from './auth.handler';
import { $ref } from './auth.schema';

const auth: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.post('/register', { schema: { body: $ref('registerUserSchema') } }, registerUserHandler);

  fastify.post('/signin', { schema: { body: $ref('signInUserSchema') } }, signInUserHandler);
};

export default auth;
