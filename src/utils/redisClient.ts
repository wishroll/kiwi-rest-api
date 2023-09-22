import { createClient } from 'redis';
import logger from './logger';
const client = createClient({
  url: process.env.REDIS_URL,
  socket: { tls: true, rejectUnauthorized: false },
});
(async () => {
  client.on('error', (err: Error) => logger(null).error(err, 'Redis Client Error'));
  client.connect();
})();
export default client;
