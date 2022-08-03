/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ratings', (table) => {
        knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
        table.bigIncrements('id').unique({ indexName: 'index_id_ratings', deferrable: 'immediate' })
        table.uuid('uuid', { useBinaryUuid: true }).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({ indexName: 'index_uuid_ratings', deferrable: 'immediate' })
        table.float('score').defaultTo(0.00).notNullable().index('index_score_ratings')
        table.bigInteger('user_id').notNullable()
        table.bigInteger('message_id').notNullable()
        table.foreign('user_id').references('users.id')
        table.foreign('message_id').references('messages.id')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('ratings')
};
