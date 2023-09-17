import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma';

export default fp(async fastify => {
  fastify.decorate('prisma', prisma);
});

declare module 'fastify' {
  export interface FastifyInstance {
    prisma: PrismaClient;
  }
}
