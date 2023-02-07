import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('views', t => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    t.bigIncrements('id').unsigned().notNullable().primary().index();
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    t.dateTime('last_seen_at').notNullable().defaultTo(knex.fn.now());
    t.bigInteger('user_id').unsigned().notNullable().index();
    t.bigInteger('viewable_id').unsigned().notNullable().index();
    t.string('viewable_type', 255).notNullable();
    t.foreign('user_id').references('users.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('views');
}
