import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('chat_messages', t => {
    t.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary()
      .unique({ indexName: 'index_id_chat_messages', deferrable: 'immediate' });
    t.uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_uuid_chat_messages', deferrable: 'immediate' });
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.text('text');
    t.bigInteger('sender_id').notNullable();
    t.bigInteger('chat_room_id').notNullable();
    t.bigInteger('song_message_id').notNullable();
    t.foreign('sender_id').references('users.id');
    t.foreign('chat_room_id').references('chat_rooms.id');
    t.foreign('song_message_id').references('messages.id');
    t.enum('type', ['song_message', 'text']).notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('chat_messages');
}
