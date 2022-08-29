/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.dropTable('messages');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.createTableIfNotExists('messages', table => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    table
      .bigIncrements('id')
      .notNullable()
      .unique({ indexName: 'index_id_messages', deferrable: 'immediate' });
    table
      .uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_uuid_messages', deferrable: 'immediate' });
    table.bigInteger('chat_room_id').notNullable().references('chat_rooms.id');
    table.bigInteger('chat_room_user_id').notNullable().references('chat_room_users.id');
    table.timestamps(true, true);
    table.text('body');
    table.string('kind', 255).notNullable().index();
  });
};
