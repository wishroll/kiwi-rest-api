// CREATE INDEX messages_recipient_id_idx ON public.messages (recipient_id,id);

exports.up = function (knex) {
  return knex.schema.alterTable('messages', t => {
    t.index(['recipient_id', 'id'], 'messages_recipient_id_idx');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('messages', t => {
    t.dropIndex(['recipient_id', 'id'], 'messages_recipient_id_idx');
  });
};
