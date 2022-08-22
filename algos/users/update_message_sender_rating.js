const {readDB} = require('../../services/db/postgres/knex_fastify_plugin');
const { updateUserRating } = require('./update_user_rating');
function updateMessageSenderRating(messageId, score) {
    console.log('This is the score', score, 'This is the message id', messageId)
    readDB('messages').select('sender_id').where({ id: messageId }).first()
        .then((result) => {
            if (result) {
                console.log('This is the result from fetching the sender id from messages', result.sender_id)
                updateUserRating(result.sender_id, score)
            } else {
                return new Error(`Couldn't find sender for message ${messageId}`)
            }
        })
        .catch((err) => {
            return err
        })
}
module.exports = {updateMessageSenderRating}