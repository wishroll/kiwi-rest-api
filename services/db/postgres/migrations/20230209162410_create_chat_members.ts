import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('chat_room_members', t => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    t.bigIncrements('id').unsigned().notNullable().primary().index();
    t.uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_chat_room_members_uuid', deferrable: 'immediate' });
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    t.bigInteger('user_id').notNullable().index();
    t.bigInteger('chat_room_id').notNullable().index();
    t.foreign('user_id').references('users.id');
    t.foreign('chat_room_id').references('chat_rooms.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('chat_room_members');
}
