'use-strict'
const { driver } = require('../index');

async function searchUsers(q, offset = 0, limit = 10) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `
        MATCH (u:User)
        WHERE u.username starts with "${q}" or u.display_name starts with "${q}"
        RETURN u.id as id, u.uuid as uuid, u.username as username, u.display_name as display_name
        UNION
        CALL db.index.fulltext.queryNodes("INDEX_USERS_FULLTEXT", "${q}~") YIELD node, score
        RETURN node.id as id, node.uuid as uuid, node.username as username, node.display_name as display_name
        order by score desc
        skip ${offset} 
        limit ${limit}`;
        const result = await session.readTransaction(tx => tx.run(query));
        const records = result.records.map(r => {
            const fields = r["_fields"];
            return fields
        }
        );
        console.log(records)
        return records;
    } catch (error) {
        console.log('An error occured when searching user nodes', error);
        return error;
    } finally {
        await session.close();
    }
}

async function searchFriends(query, userId, offset = 0, limit = 10) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = ``;
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

async function searchFriendsRequested(query, userId, offset = 0, limit = 10) {
    const session = driver.session({ database: 'neo4j' });

}

async function searchFriendsRequesting(query, userId, offset = 0, limit = 10) {
    const session = driver.session({ database: 'neo4j' });

}


async function createUserNodeFullTextSearchIndex() {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `CREATE FULLTEXT INDEX INDEX_USERS_FULLTEXT IF NOT EXISTS FOR (u:User) ON EACH [ u.username, u.display_name]`
        const result = await session.writeTransaction(tx => tx.run(query));
        return result
    } catch (error) {
        return error
    } finally {
        await session.close();
    }
}

async function createUserNodeTextIndex() {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `CREATE TEXT INDEX INDEX_USERSTEXT_USERNAME IF NOT EXISTS FOR (u:User) ON (u.username)
                        CREATE TEXT INDEX INDEX_USERSTEXT_DISPLAY_NAME IF NOT EXISTS FOR (u:User) ON (u.display_name)
                        CREATE TEXT INDEX INDEX_USERSTEXT_PHONENUMBER IF NOT EXISTS FOR (u:User) ON (u.phone_number)
                        `
        const result = await session.writeTransaction(tx => tx.run(query));
        return result
    } catch (error) {
        return error
    } finally {
        await session.close();
    }
}

module.exports = { searchUsers, searchFriends }