### Requirements

Install node and npm if you don't have it yet.

### Envs (direnv instruction)

1. Add envs from .env.example to yours env file (.env/.envrc).
2. Request access for every env mentioned in .env.example
3. Use `> direnv allow .envrc`

### Redis (if you don't use Docker)

1. Install Redis
2. Use `> brew install redis`
3. Start redis on default port (6379)
4. Use `> redis-server`

### Postgres and Redis for Docker users

1. Pull postgres image
2. Use `> docker pull postgres`
3. Pull redis image
4. Use `> docker pull redis`
5. Start docker-compose
6. Use `> docker-compose -f docker-compose.dev.yml up`
7. - Use `> docker-compose -f docker-compose.dev.yml up -d` for detached version

_. You can use pgcli to connect
_. Use `> pgcli -h 0.0.0.0 -p 5432 -d wishroll-dev -u wishroll-user -W`
\*. Type password `w1shr0ll`

### Run migrations and seeds

1. Run migrations
2. Use `> npm run migrate`
3. Run seeds
4. Use `> npm run seed`

### Run app in development mode

1. Use `> npm run dev`

### Run test

1. Use `> npm run test`
