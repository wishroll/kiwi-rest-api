const { getMutualFriends } = require('../../services/api/neo4j/recommendations');
const { default: logger } = require('../../logger');

module.exports = async (fastify) => {
  const {
    sendPushNotificationOnReceivedFriendRequest,
    sendPushNotificationOnAcceptedFriendRequest,
  } = require('../../services/notifications/notifications');
  const { phone } = require('phone');
  const { contacts, friends, requested, requests } = require('./schema/v1/index');
  const { friendship, friendshipRequest } = require('./schema/v1/create');
  const { deleteFriendship, deleteFriendshipRequest } = require('./schema/v1/delete');
  const {
    createFriendship,
    createFriendRequest,
    deleteFriendRequestRelationship,
    deleteFriendshipRelationship,
    getFriends,
  } = require('../../services/api/neo4j/friendships/index');
  const { getAllUserFriendIds } = require('../../utils/friends');

  fastify.get('/friends/requests', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const currentUserId = req.user.id;
    try {
      const currentUserPhoneNumber = await fastify
        .readDb('users')
        .select('phone_number')
        .where({ id: currentUserId })
        .first();
      const requests = await fastify
        .readDb('friend_requests')
        .select('requester_phone_number')
        .where({ requested_phone_number: currentUserPhoneNumber.phone_number });
      if (requests.length > 0) {
        res.send(requests);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });

  fastify.get('/friends/requested', { onRequest: [fastify.authenticate] }, async (req, res) => {
    // const limit = req.query.limit;
    // const offset = req.query.offset;

    const currentUserId = req.user.id;
    try {
      const currentUserPhoneNumber = await fastify
        .readDb('users')
        .select('phone_number')
        .where({ id: currentUserId })
        .first();
      const requestedPhoneNumbers = await fastify
        .readDb('friend_requests')
        .select('requested_phone_number')
        .where({ requester_phone_number: currentUserPhoneNumber.phone_number });
      if (requestedPhoneNumbers.length > 0) {
        res.send(requestedPhoneNumbers);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });

  fastify.post('/friends/request', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const currentUserId = req.user.id;
    const requestedPhoneNumber = req.body.requested_phone_number;
    const validatedPhoneNumber = phone(requestedPhoneNumber).phoneNumber;
    try {
      const currentUserPhoneNumber = await fastify
        .readDb('users')
        .select('phone_number')
        .where({ id: currentUserId })
        .first();
      const request = await fastify.writeDb('friend_requests').insert({
        requested_phone_number: validatedPhoneNumber,
        requester_phone_number: currentUserPhoneNumber.phone_number,
      });
      if (request) {
        res.status(201).send(request);
      } else {
        res.status(500).send({ error: 'Unable to create request' });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });

  fastify.post(
    '/friends/accept-request',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
      const requestingPhoneNumber = phone(req.body.requesting_phone_number).phoneNumber;
      try {
        const currentUserPhoneNumber = await fastify
          .readDb('users')
          .select('phone_number')
          .where({ id: currentUserId })
          .first();
        const friendRequest = await fastify
          .readDb('friend_requests')
          .where({
            requested_phone_number: currentUserPhoneNumber.phone_number,
            requester_phone_number: requestingPhoneNumber,
          })
          .first();
        if (friendRequest) {
          const requestingUser = await fastify
            .readDb('users')
            .where({ phone_number: requestingPhoneNumber })
            .first();
          if (requestingUser) {
            const friendship = await fastify
              .writeDb('friends')
              .insert({ friend_id: currentUserId, user_id: requestingUser.id });
            if (friendship) {
              await fastify.writeDb('friend_requests').where({ id: friendRequest.id }).del();
              res.status(201).send();
            } else {
              res.status(500).send({ message: 'Unable to create new friendship' });
            }
          } else {
            res.status(500).send({ message: 'Cannot find requesting user' });
          }
        } else {
          res.status(404).send({ message: 'There are no friend requests sent' });
        }
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  fastify.get(
    '/friends',
    { onRequest: [fastify.authenticate], schema: friends },
    async (req, res) => {
      const currentUserId = req.user.id;
      const limit = req.query.limit;
      const offset = req.query.offset;
      try {
        const friendsIds = await getAllUserFriendIds(fastify, currentUserId);
        const users = await fastify
          .readDb('users')
          .select()
          .whereIn('id', friendsIds)
          .limit(limit)
          .offset(offset);
        if (users.length > 0) {
          await Promise.all(
            users.map(async user => {
              const userId = user.id;
              let friendshipStatus = null;
              const friendship = await fastify
                .readDb('friends')
                .where({ user_id: currentUserId, friend_id: userId })
                .orWhere({ user_id: userId, friend_id: currentUserId })
                .first();
              if (friendship) {
                friendshipStatus = 'friends';
              } else {
                const sentFriendRequest = await fastify
                  .readDb('friend_requests')
                  .where({ requester_user_id: currentUserId, requested_user_id: userId })
                  .first();
                if (sentFriendRequest) {
                  friendshipStatus = 'pending_sent';
                } else {
                  const receivedFriendRequest = await fastify
                    .readDb('friend_requests')
                    .where({ requester_user_id: userId, requested_user_id: currentUserId })
                    .first();
                  if (receivedFriendRequest) {
                    friendshipStatus = 'pending_received';
                  } else {
                    friendshipStatus = 'none';
                  }
                }
              }
              user.friendship_status = friendshipStatus;
            }),
          );
          res.status(200).send(users);
        } else {
          res.status(404).send();
        }
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  /**
   * V2
   */

  fastify.post(
    '/v2/friends/request',
    { onRequest: [fastify.authenticate], schema: friendshipRequest },
    async (req, res) => {
      const currentUserId = req.user.id;
      const requestedUserId = req.body.requested_user_id;
      if (currentUserId === requestedUserId) {
        return res.status(400).send({ error: true, message: 'Request sent to current user' });
      }
      try {
        const inserts = await fastify
          .writeDb('friend_requests')
          .insert({ requested_user_id: requestedUserId, requester_user_id: currentUserId }, ['*']);
        if (!inserts || inserts.length < 1) {
          return res.status(500).send({ error: true, message: 'Request Failed' });
        }
        const request = inserts[0];
        createFriendRequest(
          currentUserId,
          requestedUserId,
          request.id,
          request.uuid,
          request.created_at,
          request.updated_at,
        ).catch(err => logger(req).error(err, 'An error occured when creating friends request'));
        sendPushNotificationOnReceivedFriendRequest(requestedUserId, currentUserId).catch(); // Send out notification
        res.status(201).send();
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  fastify.post(
    '/v2/friends/accept-request',
    { onRequest: [fastify.authenticate], schema: friendship },
    async (req, res) => {
      const currentUserId = req.user.id;
      const requestingUserId = req.body.requesting_user_id;
      if (currentUserId === requestingUserId) {
        return res
          .status(400)
          .send({ error: true, message: "Can't accept request from current user" });
      }
      try {
        const deletedFriendRequests = await fastify
          .writeDb('friend_requests')
          .where({ requested_user_id: currentUserId, requester_user_id: requestingUserId })
          .del('id');
        if (!deletedFriendRequests || deletedFriendRequests.length < 1) {
          return res.status(500).send({ error: true, message: 'Request Failed' });
        }
        const inserts = await fastify
          .writeDb('friends')
          .insert({ friend_id: currentUserId, user_id: requestingUserId }, ['*']);
        if (!inserts || inserts.length < 1) {
          return res.status(500).send({ error: true, message: 'Request Failed' });
        }
        const friendship = inserts[0];
        deleteFriendRequestRelationship(requestingUserId, currentUserId).catch();
        createFriendship(
          friendship.user_id,
          friendship.friend_id,
          friendship.id,
          friendship.uuid,
          friendship.created_at,
          friendship.updated_at,
        ).catch(err => logger(req).error(err, 'An error occured when creating the friendship'));
        sendPushNotificationOnAcceptedFriendRequest(requestingUserId, currentUserId).catch();
        res.status(201).send();
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get(
    '/v2/users/:id/friends/status',
    { onRequest: [fastify.authenticate] },
    async (req, res) => {
      const currentUserId = req.user.id;
      const userId = req.params.id;
      let friendshipStatus = null;
      if (currentUserId === userId) {
        return res.status(400).send({ error: 'Same User' });
      }
      try {
        const user = await fastify.readDb('users').select('id').where({ id: userId }).first();
        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }
        const friendship = await fastify
          .readDb('friends')
          .where({ user_id: currentUserId, friend_id: userId })
          .orWhere({ user_id: userId, friend_id: currentUserId })
          .first();
        if (friendship) {
          friendshipStatus = 'friends';
        } else {
          const sentFriendRequest = await fastify
            .readDb('friend_requests')
            .where({ requester_user_id: currentUserId, requested_user_id: userId })
            .first();
          if (sentFriendRequest) {
            friendshipStatus = 'pending_sent';
          } else {
            const receivedFriendRequest = await fastify
              .readDb('friend_requests')
              .where({ requester_user_id: userId, requested_user_id: currentUserId })
              .first();
            if (receivedFriendRequest) {
              friendshipStatus = 'pending_received';
            } else {
              friendshipStatus = 'none';
            }
          }
        }
        res.status(200).send({ friendship_status: friendshipStatus });
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  fastify.delete(
    '/v2/friends',
    { onRequest: [fastify.authenticate], schema: deleteFriendship },
    async (req, res) => {
      const currentUserId = req.user.id;
      const userId = req.body.user_id;
      try {
        const friendships = await fastify
          .writeDb('friends')
          .where({ user_id: currentUserId, friend_id: userId })
          .orWhere({ user_id: userId, friend_id: currentUserId })
          .del('id');
        if (friendships && friendships.length > 0) {
          deleteFriendshipRelationship(userId, currentUserId).catch(err =>
            logger(req).error(err, 'An error occured when deleting friendship relationship'),
          );
          res.status(200).send();
        } else {
          res.status(500).send({ error: 'Failed to delete friendship' });
        }
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  fastify.delete(
    '/v2/friends/request',
    { onRequest: [fastify.authenticate], schema: deleteFriendshipRequest },
    async (req, res) => {
      const currentUserId = req.user.id;
      const userId = req.body.user_id;
      try {
        const friendRequests = await fastify
          .writeDb('friend_requests')
          .where({ requester_user_id: currentUserId, requested_user_id: userId })
          .del('id');
        if (!friendRequests || friendRequests.length < 1) {
          return res.status(500).send({ error: true });
        }
        deleteFriendRequestRelationship(currentUserId, userId).catch(err =>
          logger(req).error(err, 'Error occured when deleting friend request relationship'),
        );
        res.status(200).send();
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  fastify.post(
    '/v2/friends/contacts',
    { onRequest: [fastify.authenticate], schema: contacts },
    async (req, res) => {
      const limit = req.query.limit;
      const offset = req.query.offset;
      const currentUserId = req.user.id;
      const contacts = req.body.contacts;
      logger(req).debug({ contacts }, 'Theses are the contacts from the query string');
      if (!contacts || contacts.length < 0) {
        return res.status(400).send({ message: 'No contacts' });
      }
      try {
        const users = await fastify
          .readDb('users')
          .whereNot('id', currentUserId)
          .whereIn('phone_number', contacts)
          .offset(offset)
          .limit(limit);
        if (users.length > 0) {
          await Promise.all(
            users.map(async user => {
              const userId = user.id;
              let friendshipStatus = null;
              const friendship = await fastify
                .readDb('friends')
                .where({ user_id: currentUserId, friend_id: userId })
                .orWhere({ user_id: userId, friend_id: currentUserId })
                .first();
              if (friendship) {
                friendshipStatus = 'friends';
              } else {
                const sentFriendRequest = await fastify
                  .readDb('friend_requests')
                  .where({ requester_user_id: currentUserId, requested_user_id: userId })
                  .first();
                if (sentFriendRequest) {
                  friendshipStatus = 'pending_sent';
                } else {
                  const receivedFriendRequest = await fastify
                    .readDb('friend_requests')
                    .where({ requester_user_id: userId, requested_user_id: currentUserId })
                    .first();
                  if (receivedFriendRequest) {
                    friendshipStatus = 'pending_received';
                  } else {
                    friendshipStatus = 'none';
                  }
                }
              }
              user.friendship_status = friendshipStatus;
            }),
          );
        }
        res.status(200).send(users);
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  fastify.get(
    '/v2/friends/requested',
    { onRequest: [fastify.authenticate], schema: requested },
    async (req, res) => {
      const limit = req.query.limit;
      const offset = req.query.offset;
      const currentUserId = req.user.id;
      try {
        const requestedUsers = await fastify
          .readDb('users')
          .join('friend_requests', 'friend_requests.requested_user_id', '=', 'users.id')
          .select([
            'users.id as id',
            'users.username as username',
            'users.avatar_url as avatar_url',
            'users.display_name as display_name',
            'friend_requests.requested_user_id as requested_user_id',
          ])
          .where({ requester_user_id: currentUserId })
          .limit(limit)
          .offset(offset)
          .orderBy('friend_requests.created_at', 'desc');
        if (requestedUsers.length > 0) {
          await Promise.all(
            requestedUsers.map(async user => {
              const userId = user.id;
              let friendshipStatus = null;
              const friendship = await fastify
                .readDb('friends')
                .where({ user_id: currentUserId, friend_id: userId })
                .orWhere({ user_id: userId, friend_id: currentUserId })
                .first();
              if (friendship) {
                friendshipStatus = 'friends';
              } else {
                const sentFriendRequest = await fastify
                  .readDb('friend_requests')
                  .where({ requester_user_id: currentUserId, requested_user_id: userId })
                  .first();
                if (sentFriendRequest) {
                  friendshipStatus = 'pending_sent';
                } else {
                  const receivedFriendRequest = await fastify
                    .readDb('friend_requests')
                    .where({ requester_user_id: userId, requested_user_id: currentUserId })
                    .first();
                  if (receivedFriendRequest) {
                    friendshipStatus = 'pending_received';
                  } else {
                    friendshipStatus = 'none';
                  }
                }
              }
              user.friendship_status = friendshipStatus;
            }),
          );
        }
        res.send(requestedUsers);
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  fastify.get(
    '/v2/friends/requests',
    { onRequest: [fastify.authenticate], schema: requests },
    async (req, res) => {
      const limit = req.query.limit;
      const offset = req.query.offset;
      const currentUserId = req.user.id;
      try {
        const requestingUsers = await fastify
          .readDb('users')
          .join('friend_requests', 'friend_requests.requester_user_id', '=', 'users.id')
          .select([
            'users.id as id',
            'users.username as username',
            'users.avatar_url as avatar_url',
            'users.display_name as display_name',
            'friend_requests.requester_user_id as requester_user_id',
          ])
          .where({ requested_user_id: currentUserId })
          .limit(limit)
          .offset(offset)
          .orderBy('friend_requests.created_at', 'desc');
        if (requestingUsers.length > 0) {
          await Promise.all(
            requestingUsers.map(async user => {
              const userId = user.id;
              let friendshipStatus = null;
              const friendship = await fastify
                .readDb('friends')
                .where({ user_id: currentUserId, friend_id: userId })
                .orWhere({ user_id: userId, friend_id: currentUserId })
                .first();
              if (friendship) {
                friendshipStatus = 'friends';
              } else {
                const sentFriendRequest = await fastify
                  .readDb('friend_requests')
                  .where({ requester_user_id: currentUserId, requested_user_id: userId })
                  .first();
                if (sentFriendRequest) {
                  friendshipStatus = 'pending_sent';
                } else {
                  const receivedFriendRequest = await fastify
                    .readDb('friend_requests')
                    .where({ requester_user_id: userId, requested_user_id: currentUserId })
                    .first();
                  if (receivedFriendRequest) {
                    friendshipStatus = 'pending_received';
                  } else {
                    friendshipStatus = 'none';
                  }
                }
              }
              user.friendship_status = friendshipStatus;
            }),
          );
        }
        res.send(requestingUsers);
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );

  fastify.get(
    '/users/:id/friends',
    { onRequest: [fastify.authenticate], schema: friends },
    async (req, res) => {
      const userId = req.params.id;
      const offset = req.query.offset;
      const limit = req.query.limit;
      try {
        const friends = await getFriends(userId, limit, offset);
        res.status(200).send(friends);
      } catch (error) {
        logger(req).error(error);
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get(
    '/users/me/friends/suggestions',
    { onRequest: [fastify.authenticate], schema: friends },
    async (req, res) => {
      // const userId = req.params.id;

      const currentUserId = req.user.id;
      const offset = req.query.offset;
      const limit = req.query.limit;
      try {
        const recommendedUsers = await getMutualFriends(currentUserId, limit, offset);
        res.status(200).send(recommendedUsers);
      } catch (error) {
        logger(req).error(error, 'Something went wrong with friends suggestions');
        res.status(500).send({ error: true, message: error });
      }
    },
  );
};
