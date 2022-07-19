/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('devices', (table) => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    table.bigIncrements('id').unique({ indexName: 'index_id_devices', deferrable: 'immediate' })
    table.uuid('uuid', { useBinaryUuid: true }).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({ indexName: 'index_uuid_devices', deferrable: 'immediate' })
    table.enu('os', ['ios', 'android', 'windows']).index('index_os_devices').notNullable()
    table.string('token', 255).notNullable().index('index_token_devices')
    table.bigInteger('user_id').notNullable().references('users.id')
    table.unique(['user_id', 'token'], {
      indexName: 'index_user_id_token_id_devices',
      deferrable: 'immediate'
    })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('devices')
}
