/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('spotify_tracks', (table) => {
      table.jsonb('album').alter({alterType: true})
      table.jsonb('external_ids').alter({alterType: true})
      table.jsonb('external_urls').alter({alterType: true})
      table.specificType('artists', 'jsonb ARRAY').alter({alterType: true})
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('spotify_tracks', (table) => {
    table.json('album').alter({alterType: true})
    table.json('external_ids').alter({alterType: true})
    table.json('external_urls').alter({alterType: true})
    table.specificType('artists', 'json ARRAY').alter({alterType: true})
  })
};
