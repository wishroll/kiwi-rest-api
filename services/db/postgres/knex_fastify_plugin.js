const knex = require('knex');
const { default: logger } = require('../../../logger');
// env
// config file
// config knex
// create knex variables

function generateProductionConfig(databaseUrl, client, maxConnections = 400, minConnections = 100) {
  return {
    client: 'postgresql',
    connection: {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: minConnections || 100,
      max: maxConnections || 100,
    },
    migrations: {
      directory: './services/db/postgres/migrations',
    },
    seeds: { directory: './services/db/postgres/seeds' },
    useNullAsDefault: true,
  };
}

function generateDevelopmentConfig(
  username = 'greatokonkwo',
  password = 'greatokonkwo',
  host = '127.0.0.1',
  database = 'mutual-api-server-development',
  _minConnections = 10,
  _maxConnections = 10,
) {
  return {
    client: 'postgresql',
    connection: {
      host: process.env.DEV_DB_HOST || host,
      username: process.env.DEV_DB_USERNAME || username,
      user: process.env.DEV_DB_USERNAME || username,
      password: process.env.DEV_DB_PASSWORD || password,
      database: process.env.DEV_DB || database,
    },
    pool: {
      min: process.env.MIN_CONNECTIONS || 10,
      max: process.env.MAX_CONNECTIONS || 100,
    },
    migrations: {
      directory: './services/db/postgres/migrations',
    },
    seeds: { directory: './services/db/postgres/seeds' },
    debug: true,
    useNullAsDefault: true,
  };
}

const MAX_CONNECTION_POOL_CONNECTIONS = 10000;
const MAX_CONNECTIONS = 500;

// eslint-disable-next-line no-extend-native
Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const productionDatabaseUrls = [
  process.env.HEROKU_POSTGRESQL_PURPLE_URL,
  process.env.HEROKU_POSTGRESQL_IVORY_URL,
  process.env.HEROKU_POSTGRESQL_AMBER_URL,
  process.env.HEROKU_POSTGRESQL_BRONZE_URL,
]; // array of db urls
const stagingDatabaseUrls = [
  process.env.HEROKU_POSTGRESQL_CRIMSON_URL,
  process.env.HEROKU_POSTGRESQL_GRAY_URL,
  process.env.HEROKU_POSTGRESQL_TEAL_URL,
  process.env.HEROKU_POSTGRESQL_CYAN_URL,
];
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
      return knex(generateProductionConfig(databaseUrl, maxConnections, minConnections));
    case 'development':
      return knex(generateDevelopmentConfig('greatokonkwo', 'greatokonkwo'));
    default:
      return null;
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
      // eslint-disable-next-line no-case-declarations
      const url = databaseUrls.sample();
      logger.debug({ url }, 'This is the chosen url');
      return knex(generateProductionConfig(url, maxConnections, minConnections));
    case 'development':
      return knex(generateDevelopmentConfig('greatokonkwo', 'greatokonkwo'));
    default:
      return null;
  }
}

const readDB = generateAndConfigKnexDBMultipleUrls(
  MAX_CONNECTIONS,
  MAX_CONNECTIONS,
  process.env.API_ENV === 'production' ? productionDatabaseUrls : stagingDatabaseUrls,
);
const writeDB = generateAndConfigKnexDB(
  MAX_CONNECTION_POOL_CONNECTIONS,
  MAX_CONNECTION_POOL_CONNECTIONS,
  process.env.DATABASE_CONNECTION_POOL_URL || process.env.DATABASE_URL,
);
module.exports = { readDB, writeDB };
