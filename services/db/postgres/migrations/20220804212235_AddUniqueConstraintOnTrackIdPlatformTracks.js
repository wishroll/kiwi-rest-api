/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('tracks', table => {
    table.dropUnique('track_id', 'unique_track_id_tracks');
    table.unique(['track_id', 'platform']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('tracks', table => {
    table.unique('track_id');
    table.dropUnique(['track_id', 'platform']);
  });
};
