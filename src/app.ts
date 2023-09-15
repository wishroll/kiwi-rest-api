import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import compress from '@fastify/compress';
import multer from 'fastify-multer';
import { v4 as uuidv4 } from 'uuid';
import logger from './utils/logger';

const envToLogger: Record<string, any> = {
  development: {
    level: 'trace',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  staging: {
    level: 'trace',
  },
  production: {
    level: 'info',
  },
};

export type AppOptions = {
  // Place your custom options for app below here.
  logger: { string: string };
  disableRequestLogging: boolean;
  maxParamLength: number;
  genReqId: (_req: any) => string;
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  logger: {
    ...envToLogger[process.env.API_ENV ?? 'production'],
    redact: ['headers.authorization'],
  },
  disableRequestLogging: true,
  maxParamLength: 1000,
  genReqId: _req => uuidv4(),
};

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // Place here your custom code!
  void fastify.register(compress);
  void fastify.register(multer.contentParser);
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'endpoints'),
    options: opts,
  });

  fastify.addHook('onRequest', (req, _reply, done) => {
    logger(req).info(
      { headers: req.headers },
      `[${req.raw.method}] ${req.raw.url} received request`,
    );
    done();
  });

  fastify.addHook('onResponse', (req, reply, done) => {
    logger(req).info(
      { statusCode: reply.raw.statusCode },
      `[${req.raw.method}] ${req.raw.url}: ${reply.raw.statusCode}`,
    );
    done();
  });
};

export default app;
export { app, options };
