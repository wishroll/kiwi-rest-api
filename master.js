const path = require('path');
const forky = require('forky');

forky({
  path: path.resolve(__dirname, '/index.js'),
  workers: process.env.WEB_CONCURRENCY || 4,
  enable_logging: true,
});
