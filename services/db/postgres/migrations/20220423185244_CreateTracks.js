/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('spotify_tracks', (table) => {
    table.json('album')
    table.specificType('artists', 'json ARRAY')
    table.specificType('available_markets', 'text ARRAY')
    table.bigint('disc_number')
    table.bigInteger('duration_ms').defaultTo(0)
    table.boolean('episode').defaultTo(false)
    table.boolean('explicit').defaultTo(false)
    table.json('external_ids')
    table.json('external_urls')
    table.string('href', 255)
    table.boolean('is_local').defaultTo(false)
    table.string('id', 255).notNullable().primary().unique()
    table.string('name', 255).notNullable()
    table.mediumint('popularity')
    table.string('preview_url', 255)
    table.boolean('track').defaultTo(true)
    table.mediumint('track_number')
    table.string('type', 255)
    table.string('uri', 255)
    table.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('spotify_tracks')
};
