/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('user_ratings', table => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    table
      .bigIncrements('id')
      .unique({ indexName: 'index_id_user_ratings', deferrable: 'immediate' });
    table
      .uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_uuid_user_ratings', deferrable: 'immediate' });
    table.bigInteger('user_id').notNullable().unique();
    table.float('score', 0.0).notNullable().defaultTo(0.11);
    table.bigInteger('num_ratings').notNullable().defaultTo(0);
    table.foreign('user_id').references('users.id');
    table.index('score');
    table.index('num_ratings');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('user_ratings');
};
