'use-strict';
const { driver } = require('../index');

async function createTrackNode(track) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const query = `
                        
        
        
        `
    } catch (error) {
        
    } finally {
        await session.close();
    }
}