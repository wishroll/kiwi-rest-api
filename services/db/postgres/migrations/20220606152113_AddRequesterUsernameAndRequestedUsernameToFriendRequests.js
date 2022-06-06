/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('friend_requests', (table) => {
        table.setNullable('requester_phone_number')
        table.setNullable('requested_phone_number')
        table.string('requester_username', 255)
        table.string('requested_username', 255)
        table.unique(['requester_username', 'requested_username'], {
            indexName: 'index_requester_username_requested_username',
            deferrable: 'immediate'
        })
        table.index(['requester_username', 'requested_username'])
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('friend_requests', (table) => {
        table.dropColumn('requester_username')
        table.dropColumn('requested_username')
        table.dropNullable('requester_phone_number')
        table.dropNullable('requested_phone_number')

    })
};
