import { FastifyReply, FastifyRequest } from 'fastify';
import logger from '../logger';
export class BusinessLogicError extends Error {
  public readonly statusCode: number;
  public readonly additionalInfo?: string;
  constructor(request: FastifyRequest, options: { statusCode: number; additionalInfo?: string }) {
    super(`Something went wrong with ${request.method} on ${request.url}`);
    Object.setPrototypeOf(this, BusinessLogicError.prototype);
    this.statusCode = options.statusCode;
    this.additionalInfo = options.additionalInfo;
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export const withErrorHandler =
  <T extends FastifyRequest, U extends FastifyReply>(
    fastifyCallback: (request: T, reply: U) => Promise<any>,
  ) =>
  async (request: T, reply: U) => {
    try {
      await fastifyCallback(request, reply);
    } catch (error) {
      if (error instanceof Error) {
        logger(request).error(error);
      }

      if (error instanceof BusinessLogicError) {
        return reply.status(error.statusCode).send({ ...error, message: error.message });
      }

      if (error instanceof ForbiddenError) {
        logger(request).error(error, 'Forbidden Error');
        return reply.status(403).send({ ...error, message: error.message });
      }

      const errorMessage = {
        message: `Something went wrong with ${request.method} on ${request.url}`,
        error,
      };

      return reply.status(500).send(errorMessage);
    }
  };
