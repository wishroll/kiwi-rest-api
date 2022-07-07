const routes = async (fastify, options) => {
    const sendNotificationOnReceivedFriendRequest =  require('../../../../services/notifications/notifications')
    const { phone } = require('phone')
    fastify.get('/friends/requests', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const limit = req.query.limit
        const offset = req.query.offset
        const currentUserId = req.user.id
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({ id: currentUserId }).first();
            const requests = await fastify.knex('friend_requests').select('requester_phone_number').where({ requested_phone_number: currentUserPhoneNumber['phone_number'] })
            if (requests.length > 0) {
                res.send(requests)
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.get('/friends/requested', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const limit = req.query.limit
        const offset = req.query.offset
        const currentUserId = req.user.id
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({ id: currentUserId }).first();
            const requestedPhoneNumbers = await fastify.knex('friend_requests').select('requested_phone_number').where({ requester_phone_number: currentUserPhoneNumber['phone_number'] })
            if (requestedPhoneNumbers.length > 0) {
                res.send(requestedPhoneNumbers)
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.post('/friends/request', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const requestedPhoneNumber = req.body.requested_phone_number
        const validated_phone_number = phone(requestedPhoneNumber).phoneNumber
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({ id: currentUserId }).first();
            const request = await fastify.knex('friend_requests').insert({ requested_phone_number: validated_phone_number, requester_phone_number: currentUserPhoneNumber['phone_number'] })
            if (request) {
                res.status(201).send(request)
            } else {
                res.status(500).send({ error: "Unable to create request" })
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.post('/friends/accept-request', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const requesting_phone_number = phone(req.body.requesting_phone_number).phoneNumber
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({ id: currentUserId }).first();
            const friend_request = await fastify.knex('friend_requests').where({ requested_phone_number: currentUserPhoneNumber['phone_number'], requester_phone_number: requesting_phone_number }).first()
            if (friend_request) {
                const requestingUser = await fastify.knex('users').where({ phone_number: requesting_phone_number }).first()
                if (requestingUser) {
                    const friendship = await fastify.knex('friends').insert({ friend_id: currentUserId, user_id: requestingUser.id })
                    if (friendship) {
                        await fastify.knex('friend_requests').where({ id: friend_request.id }).del()
                        res.status(201).send()
                    } else {
                        res.status(500).send({ message: 'Unable to create new friendship' })
                    }
                } else {
                    res.status(500).send({ message: 'Cannot find requesting user' })
                }
            } else {
                res.status(404).send({ message: 'There are no friend requests sent' })
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.get('/friends', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const limit = req.query.limit
        const offset = req.query.offset
        try {
            const createdFriendsRows = await fastify.knex('friends').select('friends.friend_id').where({ user_id: currentUserId })
            const createdFriends = createdFriendsRows.map((row) => row["friend_id"])
            const acceptedFriendsRows = await fastify.knex('friends').select('friends.user_id').where({ friend_id: currentUserId })
            const acceptedFriends = acceptedFriendsRows.map((row) => row["user_id"])
            const friends = createdFriends.concat(acceptedFriends)
            const users = await fastify.knex('users').select().whereIn('id', friends).limit(limit).offset(offset)
            if (users.length > 0) {
                console.log(users)
                res.status(200).send(users)
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    /**
     * V2
     */

    fastify.post('/v2/friends/request', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const requestedUserId = req.body.requested_user_id
        try {
            const request = await fastify.knex('friend_requests').insert({ requested_user_id: requestedUserId, requester_user_id: currentUserId })
            if (request) {
                sendNotificationOnReceivedFriendRequest(requestedUserId)
                res.status(201).send()
            } else {
                res.status(500).send({ error: "Unable to create request" })
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.post('/v2/friends/accept-request', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const requestingUserId = req.body.requesting_user_id
        try {
            const friend_request = await fastify.knex('friend_requests').where({ requested_user_id: currentUserId, requester_user_id: requestingUserId }).first()
            if (friend_request) {
                const friendship = await fastify.knex('friends').insert({ friend_id: currentUserId, user_id: requestingUserId })
                if (friendship) {
                    await fastify.knex('friend_requests').where({ id: friend_request.id }).del()
                    res.status(201).send()
                } else {
                    res.status(500).send({ message: 'Unable to create new friendship' })
                }
            } else {
                res.status(404).send({ message: 'There are no friend requests sent' })
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.get('/v2/users/:id/friends/status', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const userId = req.params.id
        let friendshipStatus = null
        if (currentUserId === userId) {
            return res.status(400).send({ error: 'Same User' })
        }
        try {
            const user = await fastify.knex('users').select('id').where({ id: userId }).first()
            if (!user) {
                return res.status(404).send({ error: 'User not found' })
            }
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
            res.status(200).send({ friendship_status: friendshipStatus })
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.delete('/v2/friends', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const userId = req.body.user_id
        try {
            const friendship = await fastify.knex('friends').where({ user_id: currentUserId, friend_id: userId }).orWhere({ user_id: userId, friend_id: currentUserId }).first()
            if (friendship) {
                const successfullyDeleted = await fastify.knex('friends').where({ id: friendship.id }).del()
                if (successfullyDeleted) {
                    res.status(200).send()
                } else {
                    res.status(500).send({ error: 'Failed to delete friendship' })
                }
            } else {
                res.status(404).send({ error: 'Not found' })
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.delete('/v2/friends/request', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const userId = req.body.user_id
        try {
            const friendRequest = await fastify.knex('friend_requests').where({ requester_user_id: currentUserId, requested_user_id: userId }).first()
            if (friendRequest) {
                const deleted = await fastify.knex('friend_requests').where({ id: friendRequest.id }).del()
                if (deleted) {
                    res.status(200).send()
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

    fastify.get('/v2/friends/requests', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const limit = req.query.limit
        const offset = req.query.offset
        const currentUserId = req.user.id
        try {
            const requestingUsers = await fastify.knex('users').join('friend_requests', 'users.id', '=', 'friend_requests.requester_user_id').select().where({ requested_user_id: currentUserId }).limit(limit).offset(offset).orderBy('friend_requests.created_at', 'desc')
            if (requestingUsers.length > 0) {
                res.send(requestingUsers)
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.get('/v2/friends/requested', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const limit = req.query.limit
        const offset = req.query.offset
        const currentUserId = req.user.id
        try {
            const currentUserPhoneNumber = await fastify.knex('users').select('phone_number').where({ id: currentUserId }).first();
            const requestedUsers = await fastify.knex('users').join('friend_requests', 'friend_requests.requested_user_id', '=', 'users.id').select().where({ requester_user_id: currentUserId }).limit(limit).offset(offset).orderBy('friend_requests.created_at', 'desc')
            if (requestedUsers.length > 0) {
                res.send(requestedUsers)
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    fastify.post('/v2/friends/contacts', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const limit = req.query.limit
        const offset = req.query.offset
        const currentUserId = req.user.id
        const contacts = req.body.contacts
        console.log('Theses are the contacts from the query string', contacts)
        if (!contacts || contacts.length < 0) {
            return res.status(400).send({ message: 'No contacts' })
        }
        try {
            const users = await fastify.knex('users').whereIn('phone_number', contacts).offset(offset).limit(limit)
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
                res.status(404).send({ message: 'Not Found' })
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })


}
module.exports = routes

