import { FastifyReply } from 'fastify';
import fetch, { FetchError } from 'node-fetch';

const spotifyClientID = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

export const spotifyRedirectUri =
  process.env.SPOTIFY_REDIRECT_APP_URI || 'kiwi://spotify-login-callback';
export const spotifyTokenEndpoint = 'https://accounts.spotify.com/api/token';
export const authString = Buffer.from(spotifyClientID + ':' + spotifyClientSecret).toString(
  'base64',
);
export const authHeader = `Basic ${authString}`;

export const tokenRequestHandler = async (res: FastifyReply, fetcher: () => Promise<void>) => {
  try {
    await fetcher();
  } catch (error) {
    if (typeof error !== 'object' || error === null) {
      return res.status(500).send({ message: 'something went wrong' });
    }
    if (error instanceof FetchError) {
      return res.status(parseInt(error.code ?? '500')).send(error);
    } else {
      return res.status(500).send({ message: 'something went wrong', ...error });
    }
  }
};

export const spotifyPost = async (url: string, params: Record<string, string>) => {
  const body = new URLSearchParams(params);

  const reqData = {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  };

  return fetch(url, reqData);
};
