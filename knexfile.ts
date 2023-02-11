import type { Knex } from 'knex';

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DEV_DB_HOST,
      user: process.env.DEV_DB_USERNAME,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB,
    },
    pool: {
      min: Number(process.env.MIN_CONNECTIONS) || 10,
      max: Number(process.env.MAX_CONNECTIONS) || 100,
    },
    migrations: {
      directory: './services/db/postgres/migrations',
    },
    seeds: { directory: './services/db/postgres/seeds' },
    debug: true,
    useNullAsDefault: true,
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_CONNECTION_POOL_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: Number(process.env.MIN_CONNECTIONS) || 100,
      max: Number(process.env.MAX_CONNECTIONS) || 9000,
    },
    migrations: {
      directory: './services/db/postgres/migrations',
    },
    seeds: { directory: './services/db/postgres/seeds' },
    useNullAsDefault: true,
  },
};

module.exports = config;
