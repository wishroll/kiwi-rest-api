import { User } from 'src/models/users';
import driver from 'src/utils/neo4js';
import logger from 'src/utils/logger';

async function createUserNode(user: User) {
  const session = driver.session({ database: 'neo4j' });
  try {
    const query = `MERGE (u:User {id: ${Number(user.id)}, uuid: "${user.uuid}", username: "${user.username}", display_name: "${user.display_name}", phone_number: "${user.phone_number}", created_at: "${user.created_at}", updated_at: "${user.updated_at}"})
                        RETURN u`;
    const result = await session.executeWrite(tx => tx.run(query));
    logger(null).debug('User has been successfully created');
    return result.records.find(r => r.get('u'));
  } catch (error) {
    logger(null).error(
      error as Error,
      'An error occured when writing to neo4j aurardb instance with function: create user',
    );
    throw error;
  } finally {
    await session.close();
  }
}

async function updateUserNode(
  userId: number,
  updates: {
    username?: string;
    display_name?: string;
    phone_number?: string;
    updated_at?: string;
    avatar_url?: string;
    bio?: string;
  },
) {
  const session = driver.session({ database: 'neo4j' });
  try {
    // Construct the query base
    let query = 'MATCH (u:User {id: $userId})';

    // Build the SET statements for updates
    const updateKeys = Object.keys(updates);
    if (updateKeys.length > 0) {
      query += ' SET ' + updateKeys.map(key => `u.${key} = $${key}`).join(', ');
    }
    query += ' RETURN u';
    const result = await session.executeWrite(tx =>
      tx.run(query, {
        userId,
        display_name: updates.display_name,
        phone_number: updates.phone_number,
        username: updates.username,
        avatar_url: updates.avatar_url,
        bio: updates.bio,
      }),
    );
    // const user = result.records.map(r => {
    //   return {
    //     // id: r.get('id'),
    //     uuid: r.get('uuid'),
    //     username: r.get('username'),
    //     display_name: r.get('display_name'),
    //     avatar_url: r.get('avatar_url'),
    //     bio: r.get('bio'),
    //     location: r.get('location'),
    //   };
    // });
    // logger(null).debug({ user }, 'User has been successfully updated');
    return result;
  } catch (error) {
    logger(null).error(error as Error, `An error occured when updating user ${userId}`);
    throw error;
  } finally {
    await session.close();
  }
}

export { createUserNode, updateUserNode };
