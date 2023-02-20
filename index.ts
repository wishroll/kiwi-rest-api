import fastify, { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerConfiguration from './services/plugins/swagger';
import compress from '@fastify/compress';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

require('newrelic');

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
  test: {
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

const buildServer = () => {
  const server: FastifyInstance = fastify({
    logger: {
      ...envToLogger[process.env.API_ENV ?? 'production'],
      redact: ['headers.authorization'],
    },
    disableRequestLogging: true,
    maxParamLength: 1000,
    genReqId: () => uuidv4(),
  });

  server.addHook('onRequest', (req, _reply, done) => {
    logger(req).info(
      { headers: req.headers },
      `[${req.raw.method}] ${req.raw.url} received request`,
    );
    done();
  });

  server.addHook('onResponse', (req, reply, done) => {
    logger(req).info(
      { statusCode: reply.raw.statusCode },
      `[${req.raw.method}] ${req.raw.url}: ${reply.raw.statusCode}`,
    );
    done();
  });

  server.register(swagger, swaggerConfiguration);
  server.ready(err => {
    if (err) throw err;
    server.swagger();
  });
  server.register(compress);
  server.register(require('./routes/index'));

  return server;
};

export default buildServer;
