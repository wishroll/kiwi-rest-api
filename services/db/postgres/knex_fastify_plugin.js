const knex = require('knex');
//env
//config file
//config knex
//create knex variables

async function generateProductionConfig(databaseUrl = process.env.DATABASE_CONNECTION_URL, client = 'postgresql', maxConnections = 400, minConnections = 100) {
    return {
        client: client,
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

const readDatabaseUrls = [process.env.HEROKU_POSTGRESQL_PURPLE_URL, process.env.HEROKU_POSTGRESQL_IVORY_URL]; // array of db urls



function generateAndConfigKnexDB(maxConnections, minConnections, ...databaseUrls) {
    switch (process.env.NODE_ENV) {
        case 'production':
            const url = databaseUrls.sample()
            return knex(generateProductionConfig(url, 'postgresql', maxConnections, minConnections))
        case 'development':
            return knex(generateDevelopmentConfig("greatokonkwo", "greatokonkwo"))
        default:
            return null
    }
}

const readDB  = generateAndConfigKnexDB(MAX_CONNECTIONS, MAX_CONNECTIONS, readDatabaseUrls)
const writeDB = generateAndConfigKnexDB(MAX_CONNECTION_POOL_CONNECTIONS, MAX_CONNECTION_POOL_CONNECTIONS, process.env.DATABASE_CONNECTION_POOL_URL || process.env.DATABASE_URL)
module.exports = { readDB, writeDB }
