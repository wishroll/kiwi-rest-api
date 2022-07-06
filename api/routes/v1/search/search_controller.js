const routes = async (fastify, options) => {
    fastify.get('/search/users', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const query = req.query.query
        const limit = req.query.limit
        const offset = req.query.offset
        if (!query || query.length < 1) {
            return res.status(400).send({ message: 'Missing query' })
        }
        try {
            const users = await fastify.knex('users').whereILike('username', `%${query}%`).limit(limit).offset(offset)
            if (users.length > 0) {
                await Promise.all(users.map(async user => {
                    const userId = user.id
                    let friendshipStatus = null
                    const friendship = await fastify.knex('friends').where({ user_id: currentUserId, friend_id: userId }).orWhere({ user_id: userId, friend_id: currentUserId }).first()
                    if (friendship) {
                        friendshipStatus = 'friends'
                    } else {
                        const sentFriendRequest = await fastify.knex('friend_requests').where({ requester_user_id: currentUserId, requested_user_id: userId }).first()
                        if (sentFriendRequest) {
                            friendshipStatus = 'pending_sent'
                        } else {
                            const receivedFriendRequest = await fastify.knex('friend_requests').where({ requester_user_id: userId, requested_user_id: currentUserId }).first()
                            if (receivedFriendRequest) {
                                friendshipStatus = 'pending_received'
                            } else {
                                friendshipStatus = 'none'
                            }
                        }
                    }
                    user['friendship_status'] = friendshipStatus
                }))
                res.status(200).send(users)
            } else {
                res.status(404).send({ message: "Not found" })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: error })
        }
    })
}
module.exports = routes