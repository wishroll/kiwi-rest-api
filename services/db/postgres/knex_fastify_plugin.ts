import knex, { Knex } from 'knex';
import logger from '../../../logger';
import { getArraySample } from '../../../utils/array';

const generateProductionConfig = (
  databaseUrl: string,
  maxConnections = 400,
  minConnections = 100,
): Knex.Config => {
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
};

const generateDevelopmentConfig = (
  username = 'greatokonkwo',
  password = 'greatokonkwo',
  host = '127.0.0.1',
  database = 'mutual-api-server-development',
  _minConnections = 10,
  _maxConnections = 10,
): Knex.Config => {
  return {
    client: 'postgresql',
    connection: {
      host: process.env.DEV_DB_HOST || host,
      user: process.env.DEV_DB_USERNAME || username,
      password: process.env.DEV_DB_PASSWORD || password,
      database: process.env.DEV_DB || database,
    },
    pool: {
      min: Number(process.env.MIN_CONNECTIONS || 10),
      max: Number(process.env.MAX_CONNECTIONS || 100),
    },
    migrations: {
      directory: './services/db/postgres/migrations',
    },
    seeds: { directory: './services/db/postgres/seeds' },
    debug: true,
    useNullAsDefault: true,
  };
};

const generateTestConfig = (): Knex.Config => {
  return {
    client: 'postgresql',
    connection: process.env.DATABASE_URL ?? '',
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './services/db/postgres/migrations',
    },
    seeds: { directory: './services/db/postgres/seeds' },
    debug: true,
    useNullAsDefault: true,
  };
};

const MAX_CONNECTION_POOL_CONNECTIONS = 10000;
const MAX_CONNECTIONS = 500;

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
const generateAndConfigKnexDB = (
  maxConnections: number,
  minConnections: number,
  databaseUrl: string | undefined,
) => {
  switch (process.env.NODE_ENV) {
    case 'production':
      if (!databaseUrl) {
        const err = new Error('Missing DB URL configuration');
        logger(null).error(err, 'Issue within knex configuration');
        throw err;
      }
      return knex(generateProductionConfig(databaseUrl, maxConnections, minConnections));
    case 'development':
      return knex(generateDevelopmentConfig('greatokonkwo', 'greatokonkwo'));
    case 'test':
      return knex(generateTestConfig());
    default:
      const err = new Error('Something went wrong. Could not create knex instance');
      logger(null).error(err, 'Error with knex instance');
      throw err;
  }
};

const generateAndConfigKnexDBMultipleUrls = (
  maxConnections: number,
  minConnections: number,
  databaseUrls: Array<string | undefined>,
) => {
  switch (process.env.NODE_ENV) {
    case 'production':
      const url = getArraySample(databaseUrls);
      if (!url) {
        const err = new Error('Missing DB URL configuration');
        logger(null).error(err, 'Issue within knex configuration');
        throw err;
      }

      logger(null).debug({ url }, 'This is the chosen url');
      return knex(generateProductionConfig(url, maxConnections, minConnections));
    case 'development':
      return knex(generateDevelopmentConfig('greatokonkwo', 'greatokonkwo'));
    case 'test':
      return knex(generateTestConfig());
    default:
      const err = new Error('Something went wrong. Could not create knex instance');
      logger(null).error(err, 'Error with knex instance');
      throw err;
  }
};

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

export { readDB, writeDB };
