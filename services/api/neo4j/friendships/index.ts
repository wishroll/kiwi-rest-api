'use-strict';
import logger from '../../../../logger';
import driver from '../index';
import { FriendRequest } from '../../../../models/friend_request';
import { Friend } from '../../../../models/friend';

export const createFriendship = async ({
  user_id,
  friend_id,
  id,
  uuid,
  created_at,
  updated_at,
}: Friend) => {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${user_id}})
                       MATCH (u2:User {id: ${friend_id}})
                       MERGE (u1)-[:FRIENDS_WITH {id: ${id}, uuid: '${uuid}', created_at: '${created_at}', updated_at: '${updated_at}'}]->(u2)
                       MERGE (u2)-[:FRIENDS_WITH {id: ${id}, uuid: '${uuid}', created_at: '${created_at}', updated_at: '${updated_at}'}]->(u1)
                       RETURN u1, u2`;
    const writeResult = await session.writeTransaction(tx => tx.run(query));
    const records = writeResult.records;
    logger(null).debug(
      { summary: writeResult.summary, records: writeResult.records },
      `These are the results of creating friendship of ${user_id} and ${friend_id}`,
    );
    return records;
  } catch (error) {
    logger(null).error(
      error,
      `An error occured when creating friendship of ${user_id} and ${friend_id}`,
    );
    return error;
  } finally {
    await session.close();
  }
};

export const createFriendRequest = async ({
  requesting_user_id,
  requested_user_id,
  id,
  uuid,
  created_at,
  updated_at,
}: FriendRequest) => {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${requesting_user_id}})
                        MATCH (u2:User {id: ${requested_user_id}})
                        MERGE (u1)-[fr:FRIEND_REQUESTED {id: ${id}, uuid: '${uuid}', created_at: '${created_at}', updated_at: '${updated_at}'}]->(u2)
                        RETURN u1, u2, fr`;
    const writeResult = await session.writeTransaction(tx => tx.run(query));
    logger(null).debug(
      { summary: writeResult.summary },
      `These are the summary of creating friendship request from ${requesting_user_id} to ${requested_user_id}`,
    );
    return writeResult.records;
  } catch (error) {
    logger(null).error(
      error,
      `An error occured when creating friendship request from ${requesting_user_id} to ${requested_user_id}`,
    );
    return error;
  } finally {
    await session.close();
  }
};

export const getFriends = async (userId: number, limit = 10, offset = 0) => {
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
    logger(null).debug({ records }, `These are the results of fetching user: ${userId}'s friends`);
    return records;
  } catch (error) {
    logger(null).error(error, `An error occured when fetching friends of user ${userId}`);
    return error;
  } finally {
    await session.close();
  }
};

export const getFriendsRequested = async (userId: number) => {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (User {id: ${userId}})-[:FRIENDS_REQUESTED]->(u:User) return u`;
    const result = await session.readTransaction(tx => tx.run(query));
    const records = result.records;
    return records;
  } catch (error) {
    logger(null).error(error, `An error occured when fetching user ${userId}'s friends`);
    return error;
  } finally {
    await session.close();
  }
};

export const getFriendsRequesting = async (userId: number) => {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (User {id: ${userId}})<-[:FRIENDS_REQUESTED]-(u:User) RETURN u`;
    const result = await session.readTransaction(tx => tx.run(query));
    const records = result.records;
    logger(null).debug({ records }, `These are the results of fetching user: ${userId}'s friends`);
    return records;
  } catch (error) {
    logger(null).error(error, `An error occured when fetching user ${userId}'s requesting friends`);
    return error;
  } finally {
    await session.close();
  }
};

export const deleteFriendshipRelationship = async (user_1_id: number, user_2_id: number) => {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${user_1_id}})
        MATCH (u2:User {id: ${user_2_id}})
        MATCH (u1)-[fr:FRIENDS_WITH]->(u2)
        MATCH (u2)-[fr2:FRIENDS_WITH]->(u1)
        DELETE fr, fr2`;
    const writeResult = await session.writeTransaction(tx => tx.run(query));
    logger(null).debug(
      { summary: writeResult.summary },
      `deleteFriendshipRelationship summary of ${user_1_id} and ${user_2_id}`,
    );
    return writeResult.records;
  } catch (error) {
    logger(null).error(
      error,
      `An error occured when deleting friendship of ${user_1_id} and ${user_2_id}`,
    );
    return error;
  } finally {
    await session.close();
  }
};

export const deleteFriendRequestRelationship = async (
  requesting_user_id: number,
  requested_user_id: number,
) => {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MATCH (u1:User {id: ${requesting_user_id}})
                        MATCH (u2:User {id: ${requested_user_id}})
                        MATCH (u1)-[fr:FRIEND_REQUESTED]->(u2)
                        DELETE fr`;
    const writeResult = await session.writeTransaction(tx => tx.run(query));
    logger(null).debug(
      { summary: writeResult.summary },
      `deleteFriendRequestRelationship summary of ${requesting_user_id} and ${requested_user_id}`,
    );
    return writeResult.records;
  } catch (error) {
    logger(null).error(
      error,
      `An error occured when deleting friendship request of ${requesting_user_id} and ${requested_user_id}`,
    );
    return error;
  } finally {
    await session.close();
  }
};
