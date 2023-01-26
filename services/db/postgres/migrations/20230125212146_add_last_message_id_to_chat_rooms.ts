import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('chat_rooms', t => {
    t.bigInteger('last_message_id').nullable();
    t.foreign('last_message_id').references('chat_messages.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('chat_rooms', t => {
    t.dropForeign('last_message_id');
  });
}
