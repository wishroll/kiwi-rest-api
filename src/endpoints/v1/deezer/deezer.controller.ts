import { FastifyInstance } from 'fastify';
import { withErrorHandler } from '../../../utils/errors';

export default async (fastify: FastifyInstance) => {
  fastify.get<{}>(
    '/callback',
    withErrorHandler(async (_, res) => {
      res.redirect(301, 'kiwi://deezer/auth');
    }),
  );
};
