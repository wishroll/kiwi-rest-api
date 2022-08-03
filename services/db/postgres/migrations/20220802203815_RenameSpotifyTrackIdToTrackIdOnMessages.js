/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('messages', (table) => {
        table.renameColumn('spotify_track_id', 'track_id')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('messages', (table) => {
        table.renameColumn('track_id', 'spotify_track_id')
    })
};
