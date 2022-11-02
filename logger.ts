import pino from 'pino';
import { serializeError } from 'serialize-error';

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'trace' });

export const logError = <T extends Error>(error: T, additionalInfo?: string) => {
  const serializedError = serializeError(error);
  logger.error(serializedError, additionalInfo);
};

export default logger;
