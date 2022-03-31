/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('messages', (table) => {
    table.bigInteger('answer_id').references('answers.id')
    table.unique(['chat_room_id', 'chat_room_user_id', 'answer_id'], {
      indexName: 'index_chat_room_id_chat_room_user_id_answer_id_on_messages',
      deferrable: 'immediate'
    })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('messages', (table) => {
    table.dropUnique(['chat_room_id', 'chat_room_user_id', 'answer_id'], 'index_chat_room_id_chat_room_user_id_answer_id_on_messages')
    table.dropColumn('answer_id')
  })
}
