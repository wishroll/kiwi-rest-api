var forky = require('forky');
forky({path: __dirname + '/index.js', workers: process.env.WEB_CONCURRENCY || 4});