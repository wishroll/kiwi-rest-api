/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('ratings', (table) => {
        table.unique(['message_id', 'user_id'])
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('ratings', (table) => {
      table.dropUnique(['message_id', 'user_id'])
  })
};
