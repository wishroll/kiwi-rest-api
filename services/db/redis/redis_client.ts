import { createClient } from '@node-redis/client';

(async () => {
  let client;
  if (process.env.NODE_ENV === 'development') {
    // Connect to redis at localhost port 6379 no password.
    client = createClient({});
    exports.client = client;
    console.log(`Redis client ${client}`);
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
    console.error('Something went wrong with Redis client');
    return;
  }

  client.on('error', (err: Error) => console.log('Redis Client Error', err));
  client.connect();
  console.log('Redis client connected!');
})();
