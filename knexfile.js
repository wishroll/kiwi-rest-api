// Update with your config settings.
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  test: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: process.env.MIN_CONNECTIONS || 1,
      max: process.env.MAX_CONNECTIONS || 10,
    },
    migrations: {
      directory: './services/db/postgres/migrations',
    },
    seeds: { directory: './services/db/postgres/seeds' },
    debug: true,
    useNullAsDefault: true,
  },

  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DEV_DB_HOST || '127.0.0.1',
      username: process.env.DEV_DB_USERNAME || 'greatokonkwo',
      user: process.env.DEV_DB_USERNAME || 'greatokonkwo',
      password: process.env.DEV_DB_PASSWORD || 'greatokonkwo',
      database: process.env.DEV_DB || 'mutual-api-server-development',
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
      min: process.env.MIN_CONNECTIONS || 100,
      max: process.env.MAX_CONNECTIONS || 9000,
    },
    migrations: {
      directory: './services/db/postgres/migrations',
    },
    seeds: { directory: './services/db/postgres/seeds' },
    useNullAsDefault: true,
  },
};
