import { createClient } from '@node-redis/client';
import logger from '../../../logger';

(async () => {
  let client;
  if (process.env.NODE_ENV === 'development') {
    // Connect to redis at localhost port 6379 no password.
    client = createClient({});
    exports.client = client;
    logger(null).info(client, 'Redis client');
  } else if (process.env.NODE_ENV === 'production') {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      },
    });
    exports.client = client;
  }

  if (!client) {
    logger(null).error(new Error('Something went wrong with Redis client'));
    return;
  }

  client.on('error', (err: Error) => logger(null).error(err, 'Redis Client Error'));
  client.connect();
  logger(null).info('Redis client connected!');
})();
