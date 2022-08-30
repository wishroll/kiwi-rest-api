'use-strict';
const { driver } = require('../index');

async function searchUsers(q, offset = 0, limit = 10, currentUserId) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `
        CALL db.index.fulltext.queryNodes("INDEX_USERS_USERNAME_FULLTEXT", "${q}") YIELD node, score
        RETURN distinct(node.id), EXISTS((node)-[:FRIENDS_WITH]-(:User{id: '${currentUserId}'})) as is_friends, EXISTS((node)-[:FRIEND_REQUESTED]->(:User{id: '${currentUserId}'})) as is_pending_received, EXISTS((node)<-[:FRIEND_REQUESTED]-(:User{id: '${currentUserId}'})) as is_pending_sent, node.id as id, node.uuid as uuid, node.username as username, node.display_name as display_name, node.avatar_url as avatar_url, score
        order by score desc
        SKIP ${offset}
        LIMIT ${limit / 2}
        UNION ALL 
        CALL db.index.fulltext.queryNodes("INDEX_USERS_DISPLAY_NAME_FULLTEXT", "${q}~") YIELD node, score
        RETURN distinct(node.id), EXISTS((node)-[:FRIENDS_WITH]-(:User{id: '${currentUserId}'})) as is_friends, EXISTS((node)-[:FRIEND_REQUESTED]->(:User{id: '${currentUserId}'})) as is_pending_received, EXISTS((node)<-[:FRIEND_REQUESTED]-(:User{id: '${currentUserId}'})) as is_pending_sent, node.id as id, node.uuid as uuid, node.username as username, node.display_name as display_name, node.avatar_url as avatar_url, score
        order by score desc
        SKIP ${offset / 2}
        LIMIT ${limit / 2}
        `;
        const result = await session.readTransaction(tx => tx.run(query));
        const records = result.records.map(r => {
            return {
                id: r.get('id'),
                uuid: r.get('uuid'),
                username: r.get('username'),
                display_name: r.get('display_name'),
                avatar_url: r.get('avatar_url'),
                friendship_status: r.get('is_friends') ? 'friends' : r.get('is_pending_received') ? 'pending_received' : r.get('is_pending_sent') ? 'pending_sent' : 'none'
            };
        });
        console.log(records);
        return records;
    } catch (error) {
        console.log('An error occured when searching user nodes', error);
        return error;
    } finally {
        await session.close();
    }
}

async function searchFriends(query, userId, _offset = 0, _limit = 10) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = '';
        const result = await session.readTransaction(tx => tx.run(query));
        const records = result.records;
        return records;
    } catch (error) {
        console.log('An error occured when searching user nodes', error);
        return error;
    } finally {
        await session.close();
    }
}

// eslint-disable-next-line no-unused-vars
async function searchFriendsRequested(query, userId, _offset = 0, _limit = 10) {
    // eslint-disable-next-line no-unused-vars
    const session = driver.session({ database: 'neo4j' });
}

// eslint-disable-next-line no-unused-vars
async function searchFriendsRequesting(query, userId, _offset = 0, _limit = 10) {
    // eslint-disable-next-line no-unused-vars
    const session = driver.session({ database: 'neo4j' });
}

// eslint-disable-next-line no-unused-vars
async function createUserNodeFullTextSearchIndex() {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query =
            'CREATE FULLTEXT INDEX INDEX_USERS_FULLTEXT IF NOT EXISTS FOR (u:User) ON EACH [ u.username, u.display_name]';
        const result = await session.writeTransaction(tx => tx.run(query));
        return result;
    } catch (error) {
        return error;
    } finally {
        await session.close();
    }
}

// eslint-disable-next-line no-unused-vars
async function createUserNodeTextIndex() {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `CREATE TEXT INDEX INDEX_USERSTEXT_USERNAME IF NOT EXISTS FOR (u:User) ON (u.username)
                        CREATE TEXT INDEX INDEX_USERSTEXT_DISPLAY_NAME IF NOT EXISTS FOR (u:User) ON (u.display_name)
                        CREATE TEXT INDEX INDEX_USERSTEXT_PHONENUMBER IF NOT EXISTS FOR (u:User) ON (u.phone_number)
                        `;
        const result = await session.writeTransaction(tx => tx.run(query));
        return result;
    } catch (error) {
        return error;
    } finally {
        await session.close();
    }
}

module.exports = { searchUsers, searchFriends };
