'use-strict';
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
    console.log('User has been successfully created');
    return result.records.find(r => r.get('u'));
  } catch (error) {
    console.log(
      'An error occured when writing to neo4j aurardb instance with function: create user',
      error,
    );
    return error;
  } finally {
    await session.close();
  }
}

async function updateUserNode(userId, updates) {
  delete updates.id;
  const session = driver.session({ database: 'neo4j' });
  try {
    let query = `MATCH (u:User {id: '${userId}'})`;
    Object.keys(updates).forEach(
      key => (query = query.concat(` SET u.${key} = '${updates[key]}'`)),
    );
    query = query.concat(
      ' RETURN u.id as id, u.uuid as uuid, u.username as username, u.dipslay_name as display_name, u.created_at as created_at, u.updated_at as updated_at, u.avatar_url as avatar_url',
    );
    const result = await session.writeTransaction(tx => tx.run(query));
    const user = result.records.map(r => {
      return {
        id: r.get('id'),
        uuid: r.get('uuid'),
        username: r.get('username'),
        display_name: r.get('display_name'),
        avatar_url: r.get('avatar_url'),
      };
    });
    console.log('User has been successfully updated', user);
    return user;
  } catch (error) {
    return error;
  } finally {
    await session.close();
  }
}

module.exports = { createUserNode, updateUserNode };
