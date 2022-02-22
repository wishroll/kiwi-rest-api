/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('chat_room_users', (table) => {
    table.bigIncrements('id').notNullable().unique({indexName: 'index_id_chat_room_users', deferrable: 'immediate'});
    table.uuid('uuid', {useBinaryUuid: true}).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({indexName: 'index_uuid_chat_room_users', deferrable: 'immediate'});
    table.bigInteger('chat_room_id').notNullable().references('chat_rooms.id');
    table.bigInteger('user_id').notNullable().references('users.id');
    table.timestamps(true, true);
    table.unique(['id', 'chat_room_id', 'user_id'], {
        indexName: 'index_id_chat_room_id_user_id',
        deferrable: 'immediate'
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('chat_room_users')
};
