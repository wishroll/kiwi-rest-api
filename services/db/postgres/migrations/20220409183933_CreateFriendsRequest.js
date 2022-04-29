/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('friend_requests', (table) => {
        knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
        table.bigIncrements('id').unique({ indexName: 'index_id_friend_requests', deferrable: 'immediate' })
        table.uuid('uuid', { useBinaryUuid: true }).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({ indexName: 'index_uuid_friend_requests', deferrable: 'immediate' })
        table.string('requester_phone_number', 255).notNullable()
        table.string('requested_phone_number', 255).notNullable()
        table.timestamps(true, true)
        table.unique(['requester_phone_number', 'requested_phone_number'], {
            indexName: 'index_requester_phone_number_requested_phone_number',
            deferrable: 'immediate'
        })
        table.index(['requester_phone_number', 'requested_phone_number'])
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('friend_requests')
};
