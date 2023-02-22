import * as zod from 'zod';
import logger from '../logger';

export const withValidation = <T>(data: unknown, schema: zod.ZodSchema<T>): T => {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof zod.ZodError) {
      logger(null).error(err, 'Some data did not passed the validation');
    } else if (err instanceof Error) {
      logger(null).error(err, 'Error with validation');
    }
    throw err;
  }
};
