module.exports = async (fastify, options) => {
    const create = require('./schema/v1/create.js')

    fastify.post('/v1/messages/:message_id/ratings', { onRequest: [fastify.authenticate], schema: create }, async (req, res) => {
        
    })

    fastify.get('/v1/messages/:message_id/rating', { onRequest: fastify.authenticate }, async (req, res) => {
        // Send Song Message ID
    })

    

}