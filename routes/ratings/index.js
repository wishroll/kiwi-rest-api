const { updateMessageSenderRating } = require('../../algos/users/update_message_sender_rating.js');
const { updateUserRating } = require('../../algos/users/update_user_rating.js');

module.exports = async (fastify, options) => {
    const create = require('./schema/v1/create.js')

    fastify.post('/v1/messages/:message_id/ratings', { onRequest: [fastify.authenticate], schema: create }, async (req, res) => {
        const messageId = req.params.message_id;
        const currentUserId = req.user.id;
        const score = req.body.score;
        try {
            const inserts = await fastify.knex('ratings').insert({ user_id: currentUserId, message_id: messageId, score: score }, ['*']);
            if (inserts.length > 0) {
                updateMessageSenderRating(messageId, score)
                res.status(201).send();
            } else {
                res.status(400).send({ error: true, message: 'Failed to create rating' });
            }
        } catch (error) {
            res.status(500).send({error: true, message: error})
        }
    })

    fastify.get('/v1/messages/:message_id/rating', { onRequest: fastify.authenticate }, async (req, res) => {
        // Send Song Message ID
    })

    

}