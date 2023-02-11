import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('emoji_reactions', t => {
    knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    t.bigIncrements('id').unsigned().notNullable().primary().index();
    t.uuid('uuid', { useBinaryUuid: true })
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .unique({ indexName: 'index_emoji_reactions_uuid', deferrable: 'immediate' });
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    t.bigInteger('user_id').notNullable().unsigned().index();
    t.string('emoji', 255).notNullable().index();
    t.bigInteger('emoji_reactionable_id').notNullable().index();
    t.string('emoji_reactionable_type', 255).notNullable().index();
    t.foreign('user_id').references('users.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('emoji_reactions');
}
