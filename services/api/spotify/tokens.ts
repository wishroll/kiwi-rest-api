import { WishrollFastifyInstance } from '../../../routes';
import { decrypt } from '../../../utils/encrypt';
import { RefreshBody, refreshSchema, SwapBody, swapSchema } from './schema/tokens';
import { handleSpotifyToken, spotifyRedirectUri } from './utils';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.post<{ Body: SwapBody }>(
    '/spotify/token/swap',
    { schema: swapSchema },
    async (req, res) => {
      const { code } = req.body;

      const requestData = {
        grant_type: 'authorization_code',
        redirect_uri: spotifyRedirectUri,
        code,
      };

      handleSpotifyToken(res, requestData);
    },
  );

  fastify.post<{ Body: RefreshBody }>(
    '/spotify/token/refresh',
    { schema: refreshSchema },
    async (req, res) => {
      const { refresh_token } = req.body;
      const refreshToken = decrypt(refresh_token);

      const requestData = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      };

      handleSpotifyToken(res, requestData);
    },
  );
};
