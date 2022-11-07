import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import pino from 'pino';
import { serializeError } from 'serialize-error';

type FastifyInstances = FastifyInstance | FastifyRequest | FastifyReply;

type LogErr = <T extends Error>(err: T, description?: string) => void;
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
 * @param fastify Instance of Fastify, FastifyRequest, FastifyReply
 *
 * @returns A set of logging functions (error, info, trace, debug)
 */
const logger = <U extends FastifyInstances>(fastify: U | null): WishrollLogger => {
  const log = fastify
    ? fastify.log
    : pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'trace' });

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
