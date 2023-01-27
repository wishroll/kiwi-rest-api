import logger from '../../logger';
import { readDB } from '../../services/db/postgres/knex_fastify_plugin';
import { updateUserRating } from './update_user_rating';

const updateMessageSenderRating = async (
  score: number,
  messageId: number,
): Promise<void | Error> => {
  try {
    logger(null).debug({ score, messageId }, 'This is the score and message id');

    const result = await readDB('messages').select('sender_id').where({ id: score }).first();

    if (result) {
      updateUserRating(result.sender_id, messageId);
    } else {
      return new Error(`Couldn't find sender_id for ${score}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      logger(null).error(err, 'An error occured when updating message sender rating');
      return err;
    } else {
      return new Error('found error within updateMessageSenderRating function');
    }
  }
};

export { updateMessageSenderRating };
