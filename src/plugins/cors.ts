import cors from '@fastify/cors';
import fp from 'fastify-plugin';

export default fp(async fastify => {
  fastify.register(cors, {
    origin: [
      /api\.thehive\.ai/,
      /localhost:3000/,
      /api\.ding\.live/,
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  });
});
