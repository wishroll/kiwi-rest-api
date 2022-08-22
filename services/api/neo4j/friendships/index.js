'use-strict'
const { driver } = require('../index');
/**
 * @param {number} user1Id - the first user to create the friend relationship with
 * @param {number} user2Id - the second user to create the friend relationship with 
 */
async function createFriendship(user1Id, user2Id) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `MATCH (u1:User {id: ${user1Id}})
                       MATCH (u2:User {id: ${user2Id}})
                       MERGE (u1)-[:FRIENDS_WITH]->(u2)
                       MERGE (u2)-[:FRIENDS_WITH]->(u1)
                       RETURN u1, u2`
        const writeResult = await session.writeTransaction(tx =>
            tx.run(query)
        )
        const records = writeResult.records;
        return records
    } catch (error) {
        console.log("An error occured when writing to neo4j aurardb instance with function: create friendship", error)
    } finally {
        await session.close()
    }
}
/**
 * 
 * @param {number} requestingUserId 
 * @param {number} requestedUserId 
 */
async function createFriendRequest(requestingUserId, requestedUserId) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `MATCH (u1:User {id: ${requestingUserId}})
                        MATCH (u2:User {id: ${requestedUserId}})
                        MERGE (u1)-[fr:FRIEND_REQUESTED]->(u2)
                        RETURN u1, u2, fr`
        const writeResult = await session.writeTransaction(tx =>
            tx.run(query)
        )
        console.log("Successfully created friend requests", writeResult.summary, writeResult.records)
    } catch (error) {
        console.log("An error occured when writing to neo4j aurardb instance with function: create friendship", error)
    } finally {
        await session.close()
    }
}

async function getFriends(userId) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `MATCH (User {id: ${userId}})-[:FRIENDS_WITH]->(u:User)`;
        const result = await session.readTransaction(tx => tx.run(query));
        const records = result.records;
        console.log(`These are the results of fetching user: ${userId}'s friends ${records}`);
        return result.records;
    } catch (error) {
        console.log(`An error occured when fetching user ${userId}'s friends`)
        return error
    } finally {
        await session.close();
    }

}

async function getFriendsRequested(userId) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `MATCH (User {id: ${userId}})-[:FRIENDS_REQUESTED]->(u:User)`;
        const result = await session.readTransaction(tx => tx.run(query));
        const records = result.records;
        console.log(`These are the results of fetching user: ${userId}'s friends ${records}`);
        return records;
    } catch (error) {
        console.log(`An error occured when fetching user ${userId}'s friends`)
        return error
    } finally {
        await session.close();
    }
}

async function getFriendsRequesting(userId) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `MATCH (User {id: ${userId}})<-[:FRIENDS_REQUESTED]-(u:User)`;
        const result = await session.readTransaction(tx => tx.run(query));
        const records = result.records;
        console.log(`These are the results of fetching user: ${userId}'s friends ${records}`);
        return records;
    } catch (error) {
        console.log(`An error occured when fetching user ${userId}'s friends`)
        return error
    } finally {
        await session.close();
    }
}

async function deleteFriendship(user1Id, user2Id) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `MATCH (u1:User {id: ${requestingUserId}})
        MATCH (u2:User {id: ${requestedUserId}})
        MATCH (u1)-[fr:FRIEND_REQUESTED]->(u2)
        DELETE fr`
    } catch (error) {

    } finally {
        await session.close();
    }

}

async function deleteFriendRequest(user1Id, user2Id) {
    const session = driver.session({ database: 'neo4j' });

}

module.exports = { createFriendship, createFriendRequest, getFriends, getFriendsRequested, getFriendsRequesting }