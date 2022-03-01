/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
      knex.raw("CREATE EXTENSION IF NOT EXISTS pgcrypto");
      table.bigIncrements('id').unique({indexName: 'index_id_users', deferrable: 'immediate'});
      table.uuid('uuid', {useBinaryUuid: true}).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({indexName: 'index_uuid_users', deferrable: 'immediate'});
      table.string('display_name', 255);
      table.string('phone_number', 255).unique({indexName: 'index_unique_phone_number_users', deferrable: 'immediate'}).notNullable();
      table.timestamps(true, true);
      table.string('avatar_url', 255);
      table.unique(['id', 'phone_number'], {
        indexName: 'index_id_phone_number_users',
        deferrable: 'immediate'
      })
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
    .dropTable('users');
};
