const knex = require('knex');
//env
//config file
//config knex
//create knex variables

function generateProductionConfig(databaseUrl, client, maxConnections = 400, minConnections = 100) {
    return {
        client: 'postgresql',
        connection: {
            connectionString: databaseUrl,
            ssl: { rejectUnauthorized: false }
        },
        pool: {
            min: minConnections || 100,
            max: maxConnections || 100,

        },
        migrations: {
            directory: './services/db/postgres/migrations'
        },
        seeds: { directory: './services/db/postgres/seeds' },
        useNullAsDefault: true
    }
}

function generateDevelopmentConfig(username, password, host = '127.0.0.1', database = 'mutual-api-server-development', minConnections = 10, maxConnections = 10) {
    return {
        client: 'postgresql',
        connection: {
            host: '127.0.0.1',
            username: username,
            password: password,
            database: database
        },
        pool: {
            min: process.env.MIN_CONNECTIONS || 10,
            max: process.env.MAX_CONNECTIONS || 100
        },
        migrations: {
            directory: './services/db/postgres/migrations'
        },
        seeds: { directory: './services/db/postgres/seeds' },
        debug: true,
        useNullAsDefault: true
    }
}



const MAX_CONNECTION_POOL_CONNECTIONS = 10000;
const MAX_CONNECTIONS = 500;
Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)];
}

const productionDatabaseUrls = [process.env.HEROKU_POSTGRESQL_PURPLE_URL, process.env.HEROKU_POSTGRESQL_IVORY_URL]; // array of db urls
const stagingDatabaseUrls = [process.env.HEROKU_POSTGRESQL_CRIMSON_URL, process.env.HEROKU_POSTGRESQL_GRAY_URL];
/**
 * 
 * @param {number} maxConnections 
 * @param {number} minConnections 
 * @param {string} databaseUrl 
 * @returns 
 */
function generateAndConfigKnexDB(maxConnections, minConnections, databaseUrl) {
    switch (process.env.NODE_ENV) {
        case 'production':
            return knex(generateProductionConfig(databaseUrl, maxConnections, minConnections))
        case 'development':
            return knex(generateDevelopmentConfig("greatokonkwo", "greatokonkwo"))
        default:
            return null
    }
}
/**
 * 
 * @param {number} maxConnections 
 * @param {number} minConnections 
 * @param {string[]} databaseUrls 
 * @override
 * @returns 
 */
function generateAndConfigKnexDBMultipleUrls(maxConnections, minConnections, databaseUrls) {
    switch (process.env.NODE_ENV) {
        case 'production':
            const url = databaseUrls.sample()
            console.log("This is the chosen url", url)
            return knex(generateProductionConfig(url, maxConnections, minConnections))
        case 'development':
            return knex(generateDevelopmentConfig("greatokonkwo", "greatokonkwo"))
        default:
            return null
    }
}

const readDB = generateAndConfigKnexDBMultipleUrls(MAX_CONNECTIONS, MAX_CONNECTIONS, process.env.NODE_ENV === 'production' ? productionDatabaseUrls : stagingDatabaseUrls)
const writeDB = generateAndConfigKnexDB(MAX_CONNECTION_POOL_CONNECTIONS, MAX_CONNECTION_POOL_CONNECTIONS, process.env.DATABASE_CONNECTION_POOL_URL || process.env.DATABASE_URL)
module.exports = { readDB, writeDB }
