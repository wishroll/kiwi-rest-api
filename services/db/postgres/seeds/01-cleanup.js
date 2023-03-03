exports.seed = async knex => {
  if (process.env.NODE_ENV !== 'development') {
    console.error('Error: seeds can only be used in development.');
    process.exit(1);
  }

  console.log('Cleaning up all tables...');
  await knex('user_ratings').del();
  await knex('devices').del();
  await knex('questions').del();
  await knex('answers').del();
  await knex('friends').del();
  await knex('friend_requests').del();
  await knex('conversation_users').del();
  await knex('spotify_tracks').del();
  await knex('tracks').del();
  await knex('ratings').del();
  await knex('replies').del();
  await knex('attachments').del();

  await knex('messages').del();
  await knex('conversations').del();
  await knex('prompts').del();
  await knex('users').del();
};
