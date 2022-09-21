import { WishrollFastifyInstance } from '../../../routes';
import { decrypt, encrypt } from '../../../utils/encrypt';
import { RefreshBody, refreshSchema, SwapBody, swapSchema } from './schema/tokens';
import { spotifyPost, spotifyEndpoint } from './utils';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.post<{ Body: SwapBody }>(
    '/spotify/token/swap',
    { schema: swapSchema },
    async (req, res) => {
      try {
        const { redirect_uri, code } = req.body;
        const requestData = {
          grant_type: 'authorization_code',
          redirect_uri,
          code,
        };
        const spotifyResponse = await spotifyPost(spotifyEndpoint, requestData).then(r => r.json());

        if ('error' in spotifyResponse) {
          return res.status(500).send({ ...spotifyResponse });
        }

        const { response, result } = spotifyResponse;

        if (result.refresh_token) {
          result.refresh_token = encrypt(result.refresh_token);
        }

        return res.status(response.statusCode).send(result);
      } catch (error) {
        if (typeof error !== 'object' || error === null) {
          return res.status(500).send({ message: 'something went wrong' });
        }
        if ('response' in error) {
          //@ts-ignore
          return res.status(error.response.statusCode).send(error.response);
        } else if ('data' in error) {
          //@ts-ignore
          return res.status(500).send(error.data);
        } else {
          return res.status(500).send({ message: 'something went wrong', ...error });
        }
      }
    },
  );

  fastify.post<{ Body: RefreshBody }>(
    '/spotify/token/refresh',
    { schema: refreshSchema },
    async (req, res) => {
      try {
        const { refresh_token } = req.body;
        const refreshToken = decrypt(refresh_token);

        const reqData = {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        };

        const spotifyResponse = await spotifyPost(spotifyEndpoint, reqData).then(r => r.json());

        if ('error' in spotifyResponse) {
          return res.status(500).send({ ...spotifyResponse });
        }

        const { response, result } = spotifyResponse;

        if (result.refresh_token) {
          result.refresh_token = encrypt(result.refresh_token);
        }

        return res.status(response.statusCode).send(result);
      } catch (error) {
        if (typeof error !== 'object' || error === null) {
          return res.status(500).send({ message: 'something went wrong' });
        }

        if ('response' in error) {
          //@ts-ignore
          return res.status(error.response.statusCode).send(error.response);
        } else if ('data' in error) {
          //@ts-ignore
          res.status(500).send(error.data);
        } else {
          return res.status(500).send({ message: 'something went wrong', ...error });
        }
      }
    },
  );
};
