'use-strict';
const { default: logger } = require('../../../../logger');
const { driver } = require('../index');
/**
 * Create a user node in graph db
 * @param {User} user
 */
async function createUserNode(user) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MERGE (u:User {id: ${user.id}, uuid: "${user.uuid}", username: "${user.username}", display_name: "${user.display_name}", phone_number: "${user.phone_number}", created_at: "${user.created_at}", updated_at: "${user.updated_at}"})
                        RETURN u`;
    const result = await session.writeTransaction(tx => tx.run(query));
    logger(null).debug('User has been successfully created');
    return result.records.find(r => r.get('u'));
  } catch (error) {
    logger(null).error(
      error,
      'An error occured when writing to neo4j aurardb instance with function: create user',
    );
    return error;
  } finally {
    await session.close();
  }
}

async function updateUserNode(userId, userPayload) {
  const updates = { ...userPayload };
  delete updates.id;
  const session = driver.session({ database: 'neo4j' });
  try {
    let query = `MATCH (u:User {id: ${userId}})`;
    Object.keys(updates).forEach(
      key => (query = query.concat(` SET u.${key} = '${updates[key]}'`)),
    );
    query = query.concat(
      ' RETURN u.id as id, u.uuid as uuid, u.username as username, u.dipslay_name as display_name, u.created_at as created_at, u.updated_at as updated_at, u.avatar_url as avatar_url, u.bio as bio, u.location as location',
    );
    const result = await session.writeTransaction(tx => tx.run(query));
    const user = result.records.map(r => {
      return {
        id: r.get('id'),
        uuid: r.get('uuid'),
        username: r.get('username'),
        display_name: r.get('display_name'),
        avatar_url: r.get('avatar_url'),
        bio: r.get('bio'),
        location: r.get('location'),
      };
    });
    logger(null).debug({ user }, 'User has been successfully updated');
    return user;
  } catch (error) {
    logger(null).error(error, `An error occured when updating user ${userId}`);
    return error;
  } finally {
    await session.close();
  }
}

async function deleteUserNode(userId) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const deleteRelationships = `
      MATCH (user:User {id: $userId}) -[r]-()
      DELETE r
    `;

    const deleteUser = `
      MATCH (user:User {id: $userId})
      DELETE user
    `;

    await session.writeTransaction(tx =>
      tx.run(deleteRelationships, { userId }).then(() => tx.run(deleteUser, { userId })),
    );
  } catch (e) {
    logger(null).error(e, `An error occurred when deleting user ${userId}`);
  } finally {
    await session.close();
  }
}

module.exports = { createUserNode, updateUserNode, deleteUserNode };
