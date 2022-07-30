/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('sent_spotify_tracks', (t) => {
      t.index(['sender_id', 'recipient_id'])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable("sent_spotify_tracks", (t) => {
      t.dropIndex(['sender_id', 'recipient_id'])
  })
};
