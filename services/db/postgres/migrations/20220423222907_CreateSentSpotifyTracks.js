/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('sent_spotify_tracks', (table) => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    table.bigIncrements('id').unique({ indexName: 'index_id_sent_spotify_tracks', deferrable: 'immediate' })
    table.uuid('uuid', { useBinaryUuid: true }).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({ indexName: 'index_uuid_sent_spotify_tracks', deferrable: 'immediate' })
    table.bigInteger('sender_id').notNullable()
    table.bigInteger('recipient_id').notNullable()
    table.string('spotify_track_id', 255).notNullable()
    table.foreign('sender_id').references('users.id')
    table.foreign('recipient_id').references('users.id')
    table.foreign('spotify_track_id').references('spotify_tracks.id')
    table.timestamps(true, true)
    //     table.unique(['sender_id', 'spotify_track_id', 'recipient_id'], {
    //         indexName: 'index_sender_id_spotify_track_id_recipient_id',
    //         deferrable: 'immediate'
    //       })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('sent_spotify_tracks')
}
