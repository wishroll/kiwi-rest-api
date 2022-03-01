/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('attachments', (table) => {
    knex.raw("CREATE EXTENSION IF NOT EXISTS pgcrypto");
    table.bigIncrements('id').notNullable().unique({indexName: 'index_id_attachments', deferrable: 'immediate'});
    table.uuid('uuid', {useBinaryUuid: true}).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({indexName: 'index_uuid_attachments', deferrable: 'immediate'});
    table.bigInteger('attachable_id').notNullable().index();
    table.string('attachable_type', 255).notNullable().index();
    table.string('name', 255).notNullable().index();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('attachments');
};
