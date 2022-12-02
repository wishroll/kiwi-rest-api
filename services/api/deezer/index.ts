import { WishrollFastifyInstance } from '../../../routes';
import { withErrorHandler } from '../../../utils/errors';
import { callbackSchema } from './schema';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{}>(
    '/deezer/callback',
    { schema: callbackSchema },
    withErrorHandler(async (_, res) => {
      res.redirect(301, 'kiwi://deezer/auth');
    }),
  );
};
