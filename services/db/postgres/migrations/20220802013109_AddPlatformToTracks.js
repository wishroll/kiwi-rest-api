/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('tracks', table => {
    table.string('platform', 255).index('index_platform_tracks').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('tracks', table => {
    table.dropIndex('platform', 'index_platform_tracks');
    table.dropColumn('platform');
  });
};
