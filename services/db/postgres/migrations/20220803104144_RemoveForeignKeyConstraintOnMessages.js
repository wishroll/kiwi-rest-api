/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('messages', (table) => {
        table.dropForeign(['track_id'], 'sent_spotify_tracks_spotify_track_id_foreign')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('messages', (table) => {
        table.foreign(['track_id'], 'sent_spotify_tracks_spotify_track_id_foreign')
    })
};
