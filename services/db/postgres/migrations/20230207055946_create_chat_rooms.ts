import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('chat_rooms', t => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    t.bigIncrements('id').unsigned().notNullable().primary().index();
    t.uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_chat_rooms', deferrable: 'immediate' });
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    t.integer('num_users').notNullable().defaultTo(0);
    t.integer('num_messages').unsigned().notNullable().defaultTo(0);
    t.specificType('user_ids', 'INTEGER ARRAY').index();
    t.bigInteger('last_message_id').unsigned().index();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('chat_rooms');
}
