// Update with your config settings.
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      username: 'greatokonkwo',
      password: 'greatokonkwo',
      database: 'mutual-api-server-development'
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
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_CONNECTION_POOL_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: process.env.MIN_CONNECTIONS || 100,
      max: process.env.MAX_CONNECTIONS || 9000, 
      
    },
    migrations: {
      directory: './services/db/postgres/migrations'
    },
    seeds: { directory: './services/db/postgres/seeds' },
    useNullAsDefault: true
  }

}
