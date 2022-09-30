/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('messages', t => {
    t.boolean('seen');
    t.bigInteger('last_sender_id');
    t.foreign('last_sender_id').references('users.id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('messages', t => {
    t.dropColumn('seen');
    t.dropColumn('last_sender_id');
  });
};
