/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('devices', t => {
    t.dropUnique(['user_id', 'token'], 'index_user_id_token_id_devices');
    t.unique(['user_id', 'token'], { indexName: 'index_user_id_token_id_devices' });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('devices', t => {
    t.dropUnique(['user_id', 'token'], 'index_user_id_token_id_devices');
    t.unique(['user_id', 'token'], {
      indexName: 'index_user_id_token_id_devices',
      deferrable: 'immediate',
    });
  });
};
