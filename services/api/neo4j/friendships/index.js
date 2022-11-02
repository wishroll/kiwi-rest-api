'use-strict';
const { driver } = require('../index');
const { logError, default: logger } = require('../../../../logger');
/**
 * @param {number} user1Id - the first user to create the friend relationship with
 * @param {number} user2Id - the second user to create the friend relationship with
 */
async function createFriendship(user1Id, user2Id, id, uuid, createdAt, updatedAt) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${user1Id}})
                       MATCH (u2:User {id: ${user2Id}})
                       MERGE (u1)-[:FRIENDS_WITH {id: ${id}, uuid: '${uuid}', created_at: '${createdAt}', updated_at: '${updatedAt}'}]->(u2)
                       MERGE (u2)-[:FRIENDS_WITH {id: ${id}, uuid: '${uuid}', created_at: '${createdAt}', updated_at: '${updatedAt}'}]->(u1)
                       RETURN u1, u2`;
    const writeResult = await session.writeTransaction(tx => tx.run(query));
    const records = writeResult.records;
    logger.debug(
      { summary: writeResult.summary, records: writeResult.records },
      `These are the results of creating friendship of ${user1Id} and ${user2Id}`,
    );
    return records;
  } catch (error) {
    logError(error, `An error occured when creating friendship of ${user1Id} and ${user2Id}`);
    return error;
  } finally {
    await session.close();
  }
}
/**
 *
 * @param {number} requestingUserId
 * @param {number} requestedUserId
 */
async function createFriendRequest(
  requestingUserId,
  requestedUserId,
  id,
  uuid,
  createdAt,
  updatedAt,
) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${requestingUserId}})
                        MATCH (u2:User {id: ${requestedUserId}})
                        MERGE (u1)-[fr:FRIEND_REQUESTED {id: ${id}, uuid: '${uuid}', created_at: '${createdAt}', updated_at: '${updatedAt}'}]->(u2)
                        RETURN u1, u2, fr`;
    const writeResult = await session.writeTransaction(tx => tx.run(query));
    logger.debug(
      { summary: writeResult.summary },
      `These are the summary of creating friendship request from ${requestingUserId} to ${requestedUserId}`,
    );
    return writeResult.records;
  } catch (error) {
    logError(
      error,
      `An error occured when creating friendship request from ${requestingUserId} to ${requestedUserId}`,
    );
    return error;
  } finally {
    await session.close();
  }
}

async function getFriends(userId, limit = 10, offset = 0) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (:User {id: ${userId}})-[:FRIENDS_WITH]->(u:User) return u.id as id, u.uuid as uuid, u.username as username, u.display_name as display_name, u.avatar_url as avatar_url SKIP ${offset} LIMIT ${limit}`;
    const result = await session.readTransaction(tx => tx.run(query));
    const records = result.records.map(r => {
      return {
        id: r.get('id'),
        uuid: r.get('uuid'),
        username: r.get('username'),
        display_name: r.get('display_name'),
        avatar_url: r.get('avatar_url'),
      };
    });
    logger.debug({ records }, `These are the results of fetching user: ${userId}'s friends`);
    return records;
  } catch (error) {
    logError(error, `An error occured when fetching friends of user ${userId}`);
    return error;
  } finally {
    await session.close();
  }
}

async function getFriendsRequested(userId) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (User {id: ${userId}})-[:FRIENDS_REQUESTED]->(u:User) return u`;
    const result = await session.readTransaction(tx => tx.run(query));
    const records = result.records;
    return records;
  } catch (error) {
    logError(error, `An error occured when fetching user ${userId}'s friends`);
    return error;
  } finally {
    await session.close();
  }
}

async function getFriendsRequesting(userId) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (User {id: ${userId}})<-[:FRIENDS_REQUESTED]-(u:User) RETURN u`;
    const result = await session.readTransaction(tx => tx.run(query));
    const records = result.records;
    logger.debug({ records }, `These are the results of fetching user: ${userId}'s friends`);
    return records;
  } catch (error) {
    logError(error, `An error occured when fetching user ${userId}'s requesting friends`);
    return error;
  } finally {
    await session.close();
  }
}

async function deleteFriendshipRelationship(user1Id, user2Id) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${user1Id}})
        MATCH (u2:User {id: ${user2Id}})
        MATCH (u1)-[fr:FRIENDS_WITH]->(u2)
        MATCH (u2)-[fr2:FRIENDS_WITH]->(u1)
        DELETE fr, fr2`;
    const writeResult = await session.writeTransaction(tx => tx.run(query));
    logger.debug(
      { summary: writeResult.summary },
      `deleteFriendshipRelationship summary of ${user1Id} and ${user2Id}`,
    );
    return writeResult.records;
  } catch (error) {
    logError(error, `An error occured when deleting friendship of ${user1Id} and ${user2Id}`);
    return error;
  } finally {
    await session.close();
  }
}

async function deleteFriendRequestRelationship(requestingUserId, requestedUserId) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${requestingUserId}})
                        MATCH (u2:User {id: ${requestedUserId}})
                        MATCH (u1)-[fr:FRIEND_REQUESTED]->(u2)
                        DELETE fr`;
    const writeResult = await session.writeTransaction(tx => tx.run(query));
    logger.debug(
      { summary: writeResult.summary },
      `deleteFriendRequestRelationship summary of ${requestingUserId} and ${requestedUserId}`,
    );
    return writeResult.records;
  } catch (error) {
    logError(
      error,
      `An error occured when deleting friendship request of ${requestingUserId} and ${requestedUserId}`,
    );
    return error;
  } finally {
    await session.close();
  }
}

module.exports = {
  createFriendship,
  createFriendRequest,
  getFriends,
  getFriendsRequested,
  getFriendsRequesting,
  deleteFriendshipRelationship,
  deleteFriendRequestRelationship,
};
