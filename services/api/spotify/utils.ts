import fetch from 'node-fetch';
const spotifyClientID = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

export const spotifyEndpoint = 'https://accounts.spotify.com/api/token';
export const authString = Buffer.from(spotifyClientID + ':' + spotifyClientSecret).toString(
  'base64',
);
export const authHeader = `Basic ${authString}`;

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
