/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('tracks', (table) => {
        table.string('release_date').alter({alterType: true})
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('tracks', (table) => {
        table.date('release_date').alter({ alterType: true })
    })
};
