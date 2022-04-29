/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('friends', (table) => {
        knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
        table.bigIncrements('id').unique({ indexName: 'index_id_friends', deferrable: 'immediate' })
        table.uuid('uuid', { useBinaryUuid: true }).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({ indexName: 'index_uuid_friends', deferrable: 'immediate' })
        table.bigInteger('user_id').references('users.id').notNullable()
        table.bigInteger('friend_id').references('users.id').notNullable()
        table.timestamps(true, true)
        table.unique(['user_id', 'friend_id'], {
            indexName: 'index_user_id_friend_id',
            deferrable: 'immediate'
        })
        table.index(['user_id', 'friend_id'])
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('friends')
};
