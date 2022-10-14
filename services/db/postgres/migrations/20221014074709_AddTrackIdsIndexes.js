/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('track_ids', t => {
    t.index(['isrc'], 'track_ids_isrc_idx');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('track_ids', t => {
    t.dropIndex(['isrc'], 'track_ids_isrc_idx');
  });
};
