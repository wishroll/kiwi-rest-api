/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('questions', table => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    table
      .bigIncrements('id')
      .notNullable()
      .unique({ indexName: 'index_id_questions', deferrable: 'immediate' });
    table
      .uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_uuid_questions', deferrable: 'immediate' });
    table.timestamps(true, true);
    table
      .bigInteger('user_id')
      .notNullable()
      .references('users.id')
      .index('index_user_id_on_questions');
    table.text('body').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('questions');
};
