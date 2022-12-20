'use-strict';
import { MAX_32INT_NEO4J, MAX_SEARCH_MATCH_SCORE } from '../../../../utils/numbers';
import logger from '../../../../logger';
import driver from '../index';

export const searchUsers = async (q: string, offset = 0, limit = 10, currentUserId: number) => {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `
        CALL db.index.fulltext.queryNodes("INDEX_USERS_USERNAME_FULLTEXT", "${q}") YIELD node, score
        RETURN distinct(node.id), EXISTS((node)-[:FRIENDS_WITH]-(:User{id: ${currentUserId}})) as is_friends, EXISTS((node)-[:FRIEND_REQUESTED]->(:User{id: ${currentUserId}})) as is_pending_received, EXISTS((node)<-[:FRIEND_REQUESTED]-(:User{id: ${currentUserId}})) as is_pending_sent, node.id as id, node.uuid as uuid, node.username as username, node.display_name as display_name, node.avatar_url as avatar_url, score
        order by score desc
        SKIP ${offset}
        LIMIT ${limit}
        UNION ALL 
        CALL db.index.fulltext.queryNodes("INDEX_USERS_DISPLAY_NAME_FULLTEXT", "${q}~") YIELD node, score
        RETURN distinct(node.id), EXISTS((node)-[:FRIENDS_WITH]-(:User{id: ${currentUserId}})) as is_friends, EXISTS((node)-[:FRIEND_REQUESTED]->(:User{id: ${currentUserId}})) as is_pending_received, EXISTS((node)<-[:FRIEND_REQUESTED]-(:User{id: ${currentUserId}})) as is_pending_sent, node.id as id, node.uuid as uuid, node.username as username, node.display_name as display_name, node.avatar_url as avatar_url, score
        order by score desc
        SKIP ${offset}
        LIMIT ${limit}
        `;
    const result = await session.readTransaction(tx => tx.run(query));
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
    logger(null).debug({ records }, `Results of searching user for query: ${q}`);
    return records;
  } catch (error) {
    logger(null).error(error, 'An error occured when searching user nodes');
    return error;
  } finally {
    await session.close();
  }
};

export const searchUsersV2 = async (
  q: string,
  limit = 10,
  currentUserId: number,
  lastId = MAX_32INT_NEO4J,
  lastScore = MAX_SEARCH_MATCH_SCORE,
) => {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `
    CALL db.index.fulltext.queryNodes("INDEX_USERS_FULLTEXT", "username:${q} OR display_name:${q}~") YIELD node, score
  
    WHERE round(score, 2, 'CEILING') <= ${lastScore} AND (node.id < ${lastId} OR round(score, 2, 'CEILING') < ${lastScore})
  
    RETURN node.id as id, EXISTS((node)-[:FRIENDS_WITH]-(:User{id: ${currentUserId}})) as is_friends, 
    EXISTS((node)-[:FRIEND_REQUESTED]->(:User{id: ${currentUserId}})) as is_pending_received, 
    EXISTS((node)<-[:FRIEND_REQUESTED]-(:User{id: ${currentUserId}})) as is_pending_sent, 
    node.uuid as uuid, node.username as username, node.display_name as display_name, 
    node.avatar_url as avatar_url, round(score, 2, 'CEILING') as score
  
    ORDER BY round(score, 2, 'CEILING') DESC, id DESC
    LIMIT ${limit}
    `;

    const result = await session.readTransaction(tx => tx.run(query));
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
        score: r.get('score'),
      };
    });
    logger(null).debug({ records }, `Results of searching user for query: ${q}`);
    return records;
  } catch (error) {
    logger(null).error(error, 'An error occured when searching user nodes');
    return error;
  } finally {
    await session.close();
  }
};
