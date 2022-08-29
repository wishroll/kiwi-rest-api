const forky = require('forky');

forky({
  // eslint-disable-next-line n/no-path-concat
  path: __dirname + '/index.js',
  workers: process.env.WEB_CONCURRENCY || 4,
  enable_logging: true,
});
