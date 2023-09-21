import fp from 'fastify-plugin';
import dingClient from 'src/utils/ding';
import Ding from '@ding-live/sdk';

export default fp(async fastify => {
  fastify.decorate('dingClient', dingClient);
});

declare module 'fastify' {
  interface FastifyInstance {
    dingClient: Ding;
  }
}
