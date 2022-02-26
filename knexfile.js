// Update with your config settings.
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      username: 'postgres',
      password: 'postgres',
      database: 'mutual-api-server-development'
    },
    pool: {
      min: process.env.MIN_CONNECTIONS || 10,
      max: process.env.MAX_CONNECTIONS || 100
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: { directory: './db/seeds' },
    debug: true,
    useNullAsDefault: true
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_URL,
      // port: process.env.DATABASE_PORT,
      // user: process.env.DATABASE_USERNAME,
      // password: process.env.DATABASE_PASSWORD,
      // database: process.env.DATABASE_NAME
    },
    pool: {
      min: process.env.MIN_CONNECTIONS || 10,
      max: process.env.MAX_CONNECTIONS || 100,
      propagateCreateError: false
    },
    migrations: {
      directory: './db/migrations',
    },
    useNullAsDefault: true
  }

};
