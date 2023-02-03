/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('users', table => {
    table.dateTime('display_name_updated_at').nullable();
    table.dateTime('username_updated_at').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('display_name_updated_at');
    table.dropColumn('username_updated_at');
  });
};
