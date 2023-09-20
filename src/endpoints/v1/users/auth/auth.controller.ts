import { FastifyPluginAsync } from 'fastify';
import { FastifyInstance } from 'fastify/types/instance';
import {
  authenticatePhoneNumberHandler,
  checkOTPCodeHandler,
  registerUserHandler,
  retryOTPHandler,
  signInUserHandler,
} from './auth.handler';
import { $ref } from './auth.schema';

const auth: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.post(
    '/send-otp-code',
    { schema: { body: $ref('authenticatePhoneNumberSchema') } },
    authenticatePhoneNumberHandler,
  );
  fastify.post(
    '/check-otp-code',
    { schema: { body: $ref('checkOTPCodeSchema') } },
    checkOTPCodeHandler,
  );
  fastify.post('/retry-otp-code', { schema: { body: $ref('retryOTPSchema') } }, retryOTPHandler);
  fastify.post('/signup', { schema: { body: $ref('registerUserSchema') } }, registerUserHandler);

  fastify.post('/login', { schema: { body: $ref('signInUserSchema') } }, signInUserHandler);
};

export default auth;
