import { FastifyReply } from 'fastify';
import { encrypt } from '../../../utils/encrypt';

const spotifyClientID = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

export const spotifyRedirectUri =
  process.env.SPOTIFY_REDIRECT_APP_URI || 'kiwi://spotify-login-callback';
export const spotifyTokenEndpoint = 'https://accounts.spotify.com/api/token';
export const authString = Buffer.from(spotifyClientID + ':' + spotifyClientSecret).toString(
  'base64',
);
export const authHeader = `Basic ${authString}`;
export const handleSpotifyToken = async (res: FastifyReply, body: Record<string, string>) =>
  tokenRequestHandler(res, async () => {
    const spotifyResponse = (await spotifyPost(body).then(response => response.json())) as {
      refresh_token: string;
    };

    if ('error' in spotifyResponse) {
      return res.status(500).send(spotifyResponse);
    }

    if (spotifyResponse.refresh_token) {
      spotifyResponse.refresh_token = encrypt(spotifyResponse.refresh_token);
    }

    return res.status(200).send(spotifyResponse);
  });

export const tokenRequestHandler = async (res: FastifyReply, fetcher: () => Promise<void>) => {
  try {
    await fetcher();
  } catch (error) {
    if (typeof error !== 'object' || error === null) {
      return res.status(500).send({ message: 'something went wrong' });
    }
  }
};

export const spotifyPost = async (params: Record<string, string>) => {
  const body = new URLSearchParams(params);

  const reqData = {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  };

  return fetch(spotifyTokenEndpoint, reqData);
};
