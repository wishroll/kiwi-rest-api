/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('prompts', table => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    table.bigIncrements('id').unique({ indexName: 'index_id_prompts', deferrable: 'immediate' });
    table
      .uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_uuid_prompts', deferrable: 'immediate' });
    table.text('body').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('prompts');
};
