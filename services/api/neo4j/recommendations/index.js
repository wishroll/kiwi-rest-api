'use-strict'
const { driver } = require('../index');

async function getMutualFriends(userId, limit = 10, offset = 0) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `MATCH (user1 { id: '${userId}' })-[:FRIENDS_WITH*2..2]-(friend_of_friend)
            WHERE NOT (user1)-[:FRIENDS_WITH]-(friend_of_friend)
            AND NOT (user1)-[:FRIEND_REQUESTED]-(friend_of_friend)
            AND user1.id <> friend_of_friend.id
            RETURN friend_of_friend, COUNT(*)
            ORDER BY COUNT(*) DESC , friend_of_friend
            SKIP ${offset}
            LIMIT ${limit}
        `
        const writeResult = await session.writeTransaction(tx =>
            tx.run(query)
        )
        console.log(writeResult.summary)
        return writeResult.records;
    } catch (error) {
        console.log(error);
        return error
    } finally {
        await session.close();
    }
}

async function getRecommendedTracks() {

}

module.exports = { getMutualFriends }