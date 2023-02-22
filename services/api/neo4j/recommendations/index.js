'use-strict';
const { default: logger } = require('../../../../logger');
const { driver } = require('../index');

async function getMutualFriends(userId, limit = 10, offset = 0) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (user1:User { id: ${userId} })-[:FRIENDS_WITH*2..2]-(friend_of_friend)
            WHERE NOT (user1)-[:FRIENDS_WITH]-(friend_of_friend)
            AND NOT (user1)-[:FRIEND_REQUESTED]-(friend_of_friend)
            AND user1.id <> friend_of_friend.id
            RETURN distinct(friend_of_friend),
            EXISTS((user1)-[:FRIENDS_WITH]-(friend_of_friend)) as is_friends,
            EXISTS((user1)-[:FRIEND_REQUESTED]->(friend_of_friend)) as is_pending_sent,
            EXISTS((user1)<-[:FRIEND_REQUESTED]-(friend_of_friend)) as is_pending_received,
            friend_of_friend.id as id,
            friend_of_friend.uuid as uuid, 
            friend_of_friend.username as username, friend_of_friend.display_name as display_name,
            friend_of_friend.avatar_url as avatar_url, COUNT(*)
            ORDER BY COUNT(*) DESC, id DESC
            SKIP ${offset}
            LIMIT ${limit}
        `;
    const result = await session.writeTransaction(tx => tx.run(query));
    const records = result.records.map(r => {
      return {
        id: r.get('id'),
        uuid: r.get('uuid'),
        username: r.get('username'),
        display_name: r.get('display_name'),
        avatar_url: r.get('avatar_url'),
        friendship_status: r.get('is_friends')
          ? 'friends'
          : r.get('is_pending_received')
          ? 'pending_received'
          : r.get('is_pending_sent')
          ? 'pending_sent'
          : 'none',
      };
    });
    return records;
  } catch (error) {
    logger(null).error(error, `An error occured when fetching mutual friends of user: ${userId}`);
    return error;
  } finally {
    await session.close();
  }
}

module.exports = { getMutualFriends };
