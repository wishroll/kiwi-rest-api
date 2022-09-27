/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('replies', t => {
    t.bigIncrements('id').unsigned().notNullable().primary();
    t.dateTime('created_at').notNullable();
    t.string('text').notNullable();
    t.boolean('seen').notNullable().defaultTo(false);

    t.bigInteger('sender_id').notNullable();
    t.bigInteger('recipient_id').notNullable();
    t.bigInteger('message_id').notNullable();

    t.foreign('message_id').references('messages.id');
    t.foreign('sender_id').references('users.id');
    t.foreign('recipient_id').references('users.id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('replies');
};
