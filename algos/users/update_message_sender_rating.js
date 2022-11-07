const { default: logger } = require('../../logger');
const { readDB } = require('../../services/db/postgres/knex_fastify_plugin');
const { updateUserRating } = require('./update_user_rating');
function updateMessageSenderRating(messageId, score) {
  logger.debug({ score, messageId }, 'This is the score and message id');
  readDB('messages')
    .select('sender_id')
    .where({ id: messageId })
    .first()
    .then(result => {
      if (result) {
        logger.debug(
          {
            senderId: result.sender_id,
          },
          'This is the result from fetching the sender id from messages',
        );
        updateUserRating(result.sender_id, score);
      } else {
        return new Error(`Couldn't find sender for message ${messageId}`);
      }
    })
    .catch(err => {
      logger(null).error(err, 'An error occured when updating message sender rating');
      return err;
    });
}
module.exports = { updateMessageSenderRating };
