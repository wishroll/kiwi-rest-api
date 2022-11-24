import { WishrollFastifyInstance } from '../../../routes';
import { withErrorHandler } from '../../../utils/errors';
import { CallbackQuery, callbackSchema } from './schema';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{ Querystring: CallbackQuery }>(
    `/deezer/callback`,
    { schema: callbackSchema },
    withErrorHandler(async (req, res) => {
      res.redirect(301, `kiwi://deezer/auth/${req.query.auth_token}`);
    }),
  );
};
