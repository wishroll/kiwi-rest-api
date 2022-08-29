/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('prompts', table => {
    table
      .string('title', 255)
      .unique({ indexName: 'index_unique_prompt_title', deferrable: 'immediate' });
    table.string('subtitle', 255);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('prompts', table => {
    table.dropIndex(['title'], 'index_unique_prompt_title');
    table.dropColumn('title');
    table.dropColumn('subtitle');
  });
};
