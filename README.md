### Requirements

Install node and npm if you don't have it yet.

### Envs (direnv instruction)

1. Add envs from .env.example to yours env file (.env/.envrc).
2. Request access for every env mentioned in .env.example
3. Use `> direnv allow .envrc`

### Redis

1. Install Redis
2. Use `> brew install redis`
3. Start redis on default port (6379)
4. Use `> redis-server`

### Postgres (Docker)

1. Pull postgres image
2. Use `> docker pull postgres`
3. Start postgres on docker
4. Use `> docker run --name wishroll-dev --rm -e POSTGRES_USER=wishroll-user -e POSTGRES_PASSWORD=w1shr0ll -p 5432:5432 -d postgres`

_. You can use pgcli to connect
_. Use `> pgcli -h 0.0.0.0 -p 5432 -U wishroll-user -W`
\*. Type password `w1shr0ll`

### Run migrations and seeds

0. run app `> npm start`

1. Run migrations
2. Use `> npm run migrate`
3. Run seeds
4. Use `> npm run seed`
