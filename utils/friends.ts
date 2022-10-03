import { WishrollFastifyInstance } from '../routes';

// TO DO: Migrate to neo4j once its performance is better than standard SQL
export const getAllUserFriendIds = async (fastify: WishrollFastifyInstance, userId: number) => {
  const [createdFriendsRows, acceptedFriendsRows] = await Promise.all([
    fastify.readDb('friends').select('friends.friend_id as userId').where({ user_id: userId }),
    fastify.readDb('friends').select('friends.user_id as userId').where({ friend_id: userId }),
  ]);
  const friends = createdFriendsRows.concat(acceptedFriendsRows);

  return friends.map(user => user.userId);
};
