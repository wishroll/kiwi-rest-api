/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('friend_requests', table => {
    table.setNullable('requester_phone_number');
    table.setNullable('requested_phone_number');
    table.bigInteger('requester_user_id');
    table.bigInteger('requested_user_id');
    table.foreign('requester_user_id').references('users.id');
    table.foreign('requested_user_id').references('users.id');
    table.unique(['requester_user_id', 'requested_user_id'], {
      indexName: 'index_requester_user_id_requested_user_id',
      deferrable: 'immediate',
    });
    table.index(['requester_user_id', 'requested_user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('friend_requests', table => {
    table.dropColumn('requester_user_id');
    table.dropColumn('requested_user_id');
    table.dropNullable('requester_phone_number');
    table.dropNullable('requested_phone_number');
  });
};
