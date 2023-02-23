import forky from 'forky';
import { env } from 'process';
import { join } from 'path';

forky({
  path: join(__dirname, '/server.js'),
  workers: Number(env.WEB_CONCURRENCY) || 4,
  enable_logging: true,
});
