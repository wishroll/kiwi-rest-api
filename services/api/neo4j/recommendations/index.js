'use-strict';
const { driver } = require('../index');

async function getMutualFriends(userId, limit = 10, offset = 0) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (user1 { id: '${userId}' })-[:FRIENDS_WITH*2..2]-(friend_of_friend)
            WHERE NOT (user1)-[:FRIENDS_WITH]-(friend_of_friend)
            AND NOT (user1)-[:FRIEND_REQUESTED]-(friend_of_friend)
            AND user1.id <> friend_of_friend.id
            RETURN friend_of_friend.id as id, friend_of_friend.uuid as uuid,
            friend_of_friend.username as username, friend_of_friend.display_name as display_name,
            friend_of_friend.avatar_url as avatar_url, COUNT(*)
            ORDER BY COUNT(*) DESC
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
      };
    });
    return records;
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    await session.close();
  }
}

// eslint-disable-next-line no-unused-vars
async function getRecommendedTracks() {}

module.exports = { getMutualFriends };
