/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('firebase_cloud_messaging_tokens', (table) => {
        knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
        table.bigIncrements('id').unique({ indexName: 'index_id_firebase_cloud_messaging_tokens', deferrable: 'immediate' })
        table.uuid('uuid', { useBinaryUuid: true }).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({ indexName: 'index_uuid_firebase_cloud_messaging_tokens', deferrable: 'immediate' })
        table.string('token', 255).notNullable().index('index_token_firebase_cloud_messaging_tokens')
        table.bigInteger('user_id').notNullable().references('users.id')
        table.unique(['user_id', 'token'], {
            indexName: 'index_user_id_token_firebase_cloud_messaging_tokens'
        })
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('firebase_cloud_messaging_tokens')
};
