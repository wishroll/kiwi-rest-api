import { WishrollFastifyInstance } from '../../../routes';
import { decrypt, encrypt } from '../../../utils/encrypt';
import { RefreshBody, refreshSchema, SwapBody, swapSchema } from './schema/tokens';
import {
  spotifyPost,
  spotifyRedirectUri,
  spotifyTokenEndpoint,
  tokenRequestHandler,
} from './utils';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.post<{ Body: SwapBody }>(
    '/spotify/token/swap',
    { schema: swapSchema },
    async (req, res) => {
      tokenRequestHandler(res, async () => {
        const { code } = req.body;
        const requestData = {
          grant_type: 'authorization_code',
          redirect_uri: spotifyRedirectUri,
          code,
        };
        const spotifyResponse = await spotifyPost(spotifyTokenEndpoint, requestData).then(r =>
          r.json(),
        );

        if ('error' in spotifyResponse) {
          return res.status(500).send({ ...spotifyResponse });
        }

        if (spotifyResponse.refresh_token) {
          spotifyResponse.refresh_token = encrypt(spotifyResponse.refresh_token);
        }

        return res.status(200).send(spotifyResponse);
      });
    },
  );

  fastify.post<{ Body: RefreshBody }>(
    '/spotify/token/refresh',
    { schema: refreshSchema },
    async (req, res) => {
      tokenRequestHandler(res, async () => {
        const { refresh_token } = req.body;
        const refreshToken = decrypt(refresh_token);

        const requestData = {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        };

        const spotifyResponse = await spotifyPost(spotifyTokenEndpoint, requestData).then(r =>
          r.json(),
        );

        if ('error' in spotifyResponse) {
          return res.status(500).send({ ...spotifyResponse });
        }

        if (spotifyResponse.refresh_token) {
          spotifyResponse.refresh_token = encrypt(spotifyResponse.refresh_token);
        }

        return res.status(200).send(spotifyResponse);
      });
    },
  );
};
