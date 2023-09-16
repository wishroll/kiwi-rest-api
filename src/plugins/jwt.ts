import jwt from '@fastify/jwt';
import { FastifyReply, FastifyRequest, onRequestHookHandler } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async fastify => {
  fastify.register(jwt, { secret: process.env.MASTER_KEY || '' });
  fastify.decorate('authenticate', async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch (error) {
      res.send(error);
    }
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: onRequestHookHandler;
    jwtVerify: () => void;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: number; uuid: string };
    user: {
      id: number;
      uuid: string;
    };
  }
}
