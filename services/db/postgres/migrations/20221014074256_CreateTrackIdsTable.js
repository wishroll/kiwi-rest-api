/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('track_ids', t => {
    t.bigIncrements('id').unsigned().notNullable().primary();
    t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    t.string('isrc', 255).notNullable().unique();

    t.string('spotify_id');
    t.string('apple_music_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('track_ids');
};
