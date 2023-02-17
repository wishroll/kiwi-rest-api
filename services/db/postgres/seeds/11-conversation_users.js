exports.seed = async knex => {
  console.log('Starting to seed friend_requests.js entries...');
  const randomUser = await knex('users').select(['id']).orderByRaw('RANDOM()');
  const randomConversation = await knex('conversations').orderByRaw('RANDOM()');

  for (let i = 0; i < 2500; i++) {
    await knex('conversation_users').insert([
      {
        user_id: randomUser[i].id,
        conversation_id: randomConversation[i].id,
      },
    ]);
  }

  console.log('Seeding friend_requests.js has been finished!');
};
