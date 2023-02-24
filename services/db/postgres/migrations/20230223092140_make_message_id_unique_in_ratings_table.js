/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// eslint-disable-next-line no-unused-vars
exports.up = function (knex) {
  return knex.schema.alterTable('ratings', function (t) {
    t.unique('message_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('ratings', function (t) {
    t.dropUnique('message_id');
  });
};
