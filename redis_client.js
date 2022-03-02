const redis = require('redis');
(async () => {
    let client = undefined;
    if (process.env.NODE_ENV === 'development') {
        client = redis.createClient(6379);
        exports.client = client;
        console.log(`Redis client ${client}`);
    } else if (process.env.NODE_ENV === 'production') {
        client = redis.createClient({url: process.env.REDIS_URL, socket: {
            tls: true,
            rejectUnauthorized: false
          }});
        exports.client = client;
    }
    client.on('error', (err) => console.log('Redis Client Error', err));
    client.connect();  
    console.log("Redis client connected!");
})();