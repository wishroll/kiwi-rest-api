/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('tracks', (table) => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    table.bigIncrements('id').unique({ indexName: 'index_id_tracks', deferrable: 'immediate' })
    table.uuid('uuid', { useBinaryUuid: true }).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({ indexName: 'index_uuid_tracks', deferrable: 'immediate' })
    table.string('track_id', 255).index('index_track_id_tracks').notNullable()
    table.string('external_url', 255).notNullable()
    table.string('preview_url', 255)
    table.string('uri', 255)
    table.string('href', 255).notNullable()
    table.string('name', 255).notNullable().index('index_name_tracks')
    table.bigInteger('duration').defaultTo(0).notNullable()
    table.bigInteger('track_number').notNullable()
    table.date('release_date')
    table.string('isrc', 255).notNullable()
    table.boolean('explicit').defaultTo(false)
    table.jsonb('artwork').notNullable()
    table.specificType('artists', 'jsonb ARRAY').notNullable()

  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('tracks')
};
