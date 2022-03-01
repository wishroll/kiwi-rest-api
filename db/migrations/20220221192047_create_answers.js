/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('answers', (table) => {
    knex.raw("CREATE EXTENSION IF NOT EXISTS pgcrypto");
    table.bigIncrements('id').notNullable().unique({indexName: 'index_id_answers', deferrable: 'immediate'});
    table.uuid('uuid', {useBinaryUuid: true}).notNullable().defaultTo(knex.raw('gen_random_uuid()')).unique({indexName: 'index_uuid_answers', deferrable: 'immediate'});
    table.bigInteger('prompt_id').notNullable().references('prompts.id');
    table.bigInteger('user_id').notNullable().references('users.id');
    table.text('body');
    table.timestamps(true, true);
    table.unique(['id', 'prompt_id', 'user_id'], {
        indexName: 'index_id_prompt_id_user_id',
        deferrable: 'immediate'
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  knex.schema.dropTable('answers');
};
