/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('answers', (table) => {
    table.unique(['prompt_id', 'user_id'], {
      indexName: 'index_prompt_id_user_id',
      deferrable: 'immediate'
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('answers', (table) => {
    table.dropIndex(['id', 'prompt_id'], 'index_prompt_id_user_id');
  });
};
