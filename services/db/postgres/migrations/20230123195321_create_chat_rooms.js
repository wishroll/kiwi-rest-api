export async function up(knex) {
  return knex.schema.createTable('chat_rooms', t => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    t.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary()
      .unique({ indexName: 'index_id_chat_rooms', deferrable: 'immediate' });
    t.uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_uuid_chat_room', deferrable: 'immediate' });
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    t.integer('num_messages').notNullable().defaultTo(0);
    t.integer('num_users').notNullable().defaultTo(0);
    t.specificType('user_ids', 'Integer ARRAY');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('chat_rooms');
}
