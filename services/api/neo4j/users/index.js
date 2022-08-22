'use-strict'
const { driver } = require('../index');
/**
 * Create a user node in graph db
 * @param {User} user 
 */
async function createUserNode(user) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `MERGE (u:User {id: ${user.id}, uuid: "${user.uuid}", username: "${user.username}", display_name: "${user.display_name}", phone_number: "${user.phone_number}", created_at: "${user.created_at}", updated_at: "${user.updated_at}"})
                        RETURN u`
        const result = await session.writeTransaction(tx => tx.run(query))
        console.log("User has been successfully created")
        return result.records.find(r => r.get('u'))
    } catch (error) {
        console.log("An error occured when writing to neo4j aurardb instance with function: create user", error)
        return error

    } finally {
        await session.close()
    }
}

async function updateUserNode(userId, updates) {
    delete updates.id;
    const session = driver.session({ database: 'neo4j' });
    try {
        let query = `MATCH (u:User {id: ${userId}})`
        Object.keys(updates).forEach(key => query = query.concat(` SET u.${key} = "${updates[key]}"`))
        const result = await session.writeTransaction(tx => tx.run(query))
        console.log("User has been successfully updated")
        return result.records.map(r => r.get('u'));
    } catch (error) {
        return error
    } finally {
        await session.close()
    }
}

async function getOverallRating() {

}

module.exports = { createUserNode, updateUserNode }