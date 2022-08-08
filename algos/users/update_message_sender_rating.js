const updateUserRating = require('./update_user_rating');
const knex = require('../../services/db/postgres/knex_fastify_plugin');
export function updateMessageSenderRating(messageId, score) {
    knex('messages').select('sender_id').where({ id: messageId }).first()
        .then((result) => {
            if (result) {
                return updateUserRating(result.sender_id, score)
            } else {
                return new Error(`Couldn't find sender for message ${messageId}`)
            }
        })
        .catch((err) => {
            return err
        })
}