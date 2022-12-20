import forky from 'forky'

forky({
  // eslint-disable-next-line n/no-path-concat
  path: __dirname + '/index.js',
  workers: Number(process.env.WEB_CONCURRENCY) || 4,
  enable_logging: true,
});
