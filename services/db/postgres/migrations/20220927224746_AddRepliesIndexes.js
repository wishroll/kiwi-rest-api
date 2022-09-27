/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('replies', t => {
    t.index(['message_id'], 'replies_message_id_idx');
    t.index(['message_id', 'recipient_id', 'id'], 'update_reply_idx');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('replies', t => {
    t.dropIndex(['message_id'], 'replies_message_id_idx');
    t.dropIndex(['message_id', 'recipient_id', 'id'], 'update_reply_idx');
  });
};
