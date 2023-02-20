import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import pino from 'pino';
import { serializeError } from 'serialize-error';

const standaloneLogger = pino({ level: process.env.API_ENV === 'production' ? 'info' : 'trace' });

type FastifyInstances = FastifyInstance | FastifyRequest | FastifyReply;

// eslint-disable-next-line no-unused-vars
type LogErr = <T extends Error>(err: T, description?: string) => void;
// eslint-disable-next-line no-unused-vars
type LogFn = <T extends object | string>(obj: T, description?: string) => void;

interface WishrollLogger {
  error: LogErr;
  info: LogFn;
  trace: LogFn;
  debug: LogFn;
}

/**
 * This function acts as a facade for logging. For our implementation,
 * we can not reach FastifyInstance, FastifyRequest, or FastifyReply
 * in every place to use a logger.
 *
 * For those places, where a built-in logger can not be used,
 * we can use a standalone pino instance.
 *
 * @param fastify An instance of Fastify, FastifyRequest, FastifyReply.
 * If none of them are available, pass `null` to use standalone logger
 *
 * @returns A set of logging functions (`error`, `info`, `trace`, `debug`)
 *
 * @example
 * logger(null).info("some info")
 *
 * .catch(err => logger(req).error(err, "Some error"))
 */
const logger = <U extends FastifyInstances>(fastify: U | null): WishrollLogger => {
  const log = fastify ? fastify.log : standaloneLogger;

  return {
    error: <T extends Error>(error: T, additionalInfo?: string) =>
      log.error(serializeError(error), additionalInfo),

    // Needed to add functions, as pino methods are not bound to their object
    info: (obj, description) => log.info(obj, description),
    trace: (obj, description) => log.trace(obj, description),
    debug: (obj, description) => log.debug(obj, description),
  };
};

export default logger;
