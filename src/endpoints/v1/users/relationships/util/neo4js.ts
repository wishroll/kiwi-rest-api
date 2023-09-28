import logger from '../../../../../utils/logger';
import { User } from 'src/models/users';
import driver from 'src/utils/neo4js';

/**
 * @param {number} user1Id - the first user to create the friend relationship with
 * @param {number} user2Id - the second user to create the friend relationship with
 */
async function createRelationship(
  user1Id: number,
  user2Id: number,
  createdAt: string,
  updatedAt: string,
) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${user1Id}})
                       MATCH (u2:User {id: ${user2Id}})
                       MERGE (u1)-[:FRIENDS_WITH {created_at: '${createdAt}', updated_at: '${updatedAt}'}]->(u2)
                       MERGE (u2)-[:FRIENDS_WITH {created_at: '${createdAt}', updated_at: '${updatedAt}'}]->(u1)
                       RETURN u1, u2`;
    const writeResult = await session.executeWrite(tx => tx.run(query));
    const records = writeResult.records;
    logger(null).debug(
      { summary: writeResult.summary, records: writeResult.records },
      `These are the results of creating friendship of ${user1Id} and ${user2Id}`,
    );
    return records;
  } catch (error) {
    logger(null).error(
      error as Error,
      `An error occured when creating friendship of ${user1Id} and ${user2Id}`,
    );
    throw error;
  } finally {
    await session.close();
  }
}

/**
 *
 * @param {number} requestingUserId
 * @param {number} requestedUserId
 */
async function createRelationshipRequest(
  requestingUserId: number,
  requestedUserId: number,
  createdAt: string,
  updatedAt: string,
) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${requestingUserId}})
                        MATCH (u2:User {id: ${requestedUserId}})
                        MERGE (u1)-[fr:FRIEND_REQUESTED {created_at: '${createdAt}', updated_at: '${updatedAt}'}]->(u2)
                        RETURN u1, u2, fr`;
    const writeResult = await session.executeWrite(tx => tx.run(query));
    logger(null).debug(
      { summary: writeResult.summary },
      `These are the summary of creating friendship request from ${requestingUserId} to ${requestedUserId}`,
    );
    return writeResult.records;
  } catch (error) {
    logger(null).error(
      error as Error,
      `An error occured when creating friendship request from ${requestingUserId} to ${requestedUserId}`,
    );
    throw error;
  } finally {
    await session.close();
  }
}

/**
 *
 * @param userId
 * @param limit
 * @param offset
 * @returns
 */
async function getRelationships(userId: number, _limit: bigint, _offset: bigint): Promise<User[]> {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (currentUser:User {id: ${userId}})-[:FRIENDS_WITH]->(user:User) return user.id as id, user.uuid as uuid, 
    user.username as username, user.display_name as display_name, user.avatar_url as avatar_url,
     EXISTS((currentUser)-[:FRIENDS_WITH]-(user)) as is_friends,
            EXISTS((currentUser)-[:FRIEND_REQUESTED]->(user)) as is_pending_sent,
            EXISTS((currentUser)<-[:FRIEND_REQUESTED]-(user)) as is_pending_received`;
    const result = await session.executeWrite(tx => tx.run(query));
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
      } as User;
    });
    logger(null).debug({ records }, `These are the results of fetching user: ${userId}'s friends`);
    return records;
  } catch (error) {
    logger(null).error(error as Error, `An error occured when fetching friends of user ${userId}`);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 *
 * @param userId
 * @returns
 */
async function getRelationshipsRequested(userId: number, _limit: bigint, _offset: bigint) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (currentUser:User {id: ${userId}})-[:FRIEND_REQUESTED]->(user:User) 
    RETURN user.id as id, user.uuid as uuid, 
    user.username as username, 
    user.display_name as display_name, 
    user.avatar_url as avatar_url,
            EXISTS((currentUser)-[:FRIENDS_WITH]-(user)) as is_friends,
            EXISTS((currentUser)-[:FRIEND_REQUESTED]->(user)) as is_pending_sent,
            EXISTS((currentUser)<-[:FRIEND_REQUESTED]-(user)) as is_pending_received`;
    const result = await session.executeRead(tx => tx.run(query));
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
      } as User;
    });
    return records;
  } catch (error) {
    logger(null).error(error as Error, `An error occured when fetching user ${userId}'s friends`);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 *
 * @param userId
 * @returns
 */
async function getRelationshipsRequesting(userId: number, _limit: bigint, _offset: bigint) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (currentUser:User {id: ${userId}})<-[:FRIEND_REQUESTED]-(user:User) RETURN user.id as id, user.uuid as uuid, 
    user.username as username, user.display_name as display_name, user.avatar_url as avatar_url,
                EXISTS((currentUser)-[:FRIENDS_WITH]-(user)) as is_friends,
            EXISTS((currentUser)-[:FRIEND_REQUESTED]->(user)) as is_pending_sent,
            EXISTS((currentUser)<-[:FRIEND_REQUESTED]-(user)) as is_pending_received`;
    const result = await session.executeRead(tx => tx.run(query));
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
      } as User;
    });
    logger(null).debug({ records }, `These are the results of fetching user: ${userId}'s friends`);
    return records;
  } catch (error) {
    logger(null).error(
      error as Error,
      `An error occured when fetching user ${userId}'s requesting friends`,
    );
    throw error;
  } finally {
    await session.close();
  }
}

/**
 *
 * @param user1Id
 * @param user2Id
 * @returns
 */
async function deleteRelationship(user1Id: number, user2Id: number) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${user1Id}})
        MATCH (u2:User {id: ${user2Id}})
        MATCH (u1)-[fr:FRIENDS_WITH]->(u2)
        MATCH (u2)-[fr2:FRIENDS_WITH]->(u1)
        DELETE fr, fr2`;
    const writeResult = await session.executeWrite(tx => tx.run(query));
    logger(null).debug(
      { summary: writeResult.summary },
      `deleteRelationship summary of ${user1Id} and ${user2Id}`,
    );
    return writeResult.records;
  } catch (error) {
    logger(null).error(
      error as Error,
      `An error occured when deleting friendship of ${user1Id} and ${user2Id}`,
    );
    throw error;
  } finally {
    await session.close();
  }
}

/**
 *
 * @param requestingUserId
 * @param requestedUserId
 * @returns
 */
async function deleteRelationshipRequest(requestingUserId: number, requestedUserId: number) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${requestingUserId}})
                        MATCH (u2:User {id: ${requestedUserId}})
                        MATCH (u1)-[fr:FRIEND_REQUESTED]->(u2)
                        DELETE fr`;
    const writeResult = await session.executeWrite(tx => tx.run(query));
    logger(null).debug(
      { summary: writeResult.summary },
      `deleteFriendRequestRelationship summary of ${requestingUserId} and ${requestedUserId}`,
    );
    return writeResult.records;
  } catch (error) {
    logger(null).error(
      error as Error,
      `An error occured when deleting friendship request of ${requestingUserId} and ${requestedUserId}`,
    );
    throw error;
  } finally {
    await session.close();
  }
}

async function getSuggestedRelationships(userId: number, limit: bigint, offset: bigint) {
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
    const result = await session.executeWrite(tx => tx.run(query));
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
      } as User;
    });
    return records;
  } catch (error) {
    logger(null).error(
      error as Error,
      `An error occured when fetching mutual friends of user: ${userId}`,
    );
    throw error;
  } finally {
    await session.close();
  }
}

async function getRelationshipStatus(userId: number, friendId: number) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `           
            MATCH (currentUser:User {id: ${userId}})
            MATCH (user:User {id: ${friendId}})
            RETURN 
            EXISTS((currentUser)-[:FRIENDS_WITH]-(user)) AS is_friends,
            EXISTS((currentUser)-[:FRIEND_REQUESTED]->(user)) AS is_pending_sent,
            EXISTS((currentUser)<-[:FRIEND_REQUESTED]-(user)) AS is_pending_received`;
    const result = await session.executeWrite(tx => tx.run(query));
    const relationshipStatus = result.records.flatMap(r => {
      return r.get('is_friends')
        ? 'friends'
        : r.get('is_pending_received')
        ? 'pending_received'
        : r.get('is_pending_sent')
        ? 'pending_sent'
        : 'none';
    });
    return relationshipStatus;
  } catch (error) {
    logger(null).error(
      error as Error,
      `An error occured when fetching mutual friends of user: ${userId}`,
    );
    throw error;
  } finally {
    await session.close();
  }
}

export {
  createRelationship,
  createRelationshipRequest,
  getRelationships,
  getRelationshipsRequested,
  getRelationshipsRequesting,
  deleteRelationship,
  deleteRelationshipRequest,
  getSuggestedRelationships,
  getRelationshipStatus,
};
