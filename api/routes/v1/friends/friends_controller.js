const routes = async (fastify, options) => {
    fastify.get('/friends/requests', { onRequest: [fastify.authenticate]}, async (req, res) => {
        const limit = req.query.limit
        const offset = req.query.offset
        const currentUserId = req.user.id
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({id: currentUserId}).first();
            const requests = await fastify.knex('friend_requests').select('requester_phone_number').where({requested_phone_number: currentUserPhoneNumber['phone_number']})
            if(requests.length > 0) {
                res.send(requests)
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.get('/friends/requested', {onRequest: [fastify.authenticate]}, async (req, res) => {
        const limit = req.query.limit
        const offset = req.query.offset
        const currentUserId = req.user.id
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({id: currentUserId}).first();
            const requestedPhoneNumbers = await fastify.knex('friend_requests').select('requested_phone_number').where({requester_phone_number: currentUserPhoneNumber['phone_number']})
            if(requestedPhoneNumbers.length > 0) {
                res.send(requestedPhoneNumbers)
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.post('/friends/request', {onRequest: [fastify.authenticate]}, async (req, res) => {
        const currentUserId = req.user.id
        const requestedPhoneNumber = req.body.requested_phone_number
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({id: currentUserId}).first();
            const request = await fastify.knex('friend_requests').insert({requested_phone_number: requestedPhoneNumber, requester_phone_number: currentUserPhoneNumber['phone_number']})
            if(request) {
                res.status(201).send(request)
            } else {
                res.status(500).send({error: "Unable to create request"})
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.post('/friends/accept-request', {onRequest: [fastify.authenticate]}, async (req, res) => {
        const currentUserId = req.user.id
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({id: currentUserId}).first();
            const request = await fastify.knex('friend_requests').where({requested_phone_number: currentUserPhoneNumber['phone_number']})
            if(request) {
                const requestingUser = await fastify.knex('users').where({phone_number: request.requester_phone_number}).first()
                if (requestingUser) {
                    const friendship = await fastify.knex('friends').insert({friend_id: currentUserId, user_id: requestingUser.id})
                    if(friendship) {
                        res.status(201).send()
                    } else {
                        res.status(500).send()
                    }
                } else {
                    res.status(500).send()
                }
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })
}
module.exports = routes

