module.exports = async (fastify, options) => {
    const create = require('./schema/create')
    fastify.post('/firebase/cloud_messaging/users/tokens', { onRequest: [fastify.authenticate], schema: create }, async (req, res) => {
        const token = req.body.token;
        const currentUserId = req.user.id;
        try {
            const insert = await fastify.writeDb('firebase_cloud_messaging_tokens').insert({ token, user_id: currentUserId }, ['*']).onConflict(['user_id', 'token']).merge({token});
            if (insert && insert.length > 0) {
                console.log(insert)
                res.status(201).send(insert[0])
            }
        } catch (error) {
            res.status(500).send({ error: true, message: "Internal Server Error" })
        }
    })
}