const routes = async (fastify, options) => {
    const { index } = require('./schema/v1/index')
    const {show} = require('./schema/v1/show')

    fastify.get('/v1/conversations/:conversation_id/messages', { onRequest: [fastify.authenticate], schema: index }, async (req, res) => {
        const currentUserId = req.user.id
        res.status(200).send('Hey')
    })

    fastify.get('/v1/messages/:id', { onRequest: [fastify.authenticate], schema: show }, async (req, res) => {
        const currentUserId = req.user.id
        res.status(200).send('Hey')
    })

}

module.exports = routes