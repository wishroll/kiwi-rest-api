/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('chat_rooms', (table) => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    table.bigIncrements('id').notNullable().unique({ indexName: 'index_id_chat_rooms', deferrable: 'immediate' })
    table.uuid('uuid', { useBinaryUuid: true }).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({ indexName: 'index_uuid_chat_rooms', deferrable: 'immediate' })
    table.timestamps(true, true)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('chat_rooms')
}
