import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('chat_room_messages', t => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    t.bigIncrements('id').unsigned().notNullable().primary();
    t.uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_chat_room_messages_uuid', deferrable: 'immediate' });
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    t.bigInteger('chat_room_id').unsigned().notNullable().index();
    t.bigInteger('sender_id').unsigned().notNullable().index();
    t.bigInteger('song_message_id').unsigned().nullable();
    t.enum('type', ['text', 'song', 'image', 'video', 'audio', 'text']).notNullable().index();
    t.text('text').nullable();
    t.foreign('chat_room_id').references('chat_rooms.id');
    t.foreign('sender_id').references('users.id');
    t.foreign('song_message_id').references('messages.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('chat_room_messages');
}
