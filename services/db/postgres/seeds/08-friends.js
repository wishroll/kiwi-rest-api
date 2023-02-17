exports.seed = async knex => {
  console.log('Starting to seed friends.js entries...');
  const randomFirstUser = await knex('users').select('id').orderByRaw('RANDOM()');
  const randomSecondUser = await knex('users').select('id').orderByRaw('RANDOM()');

  for (let i = 0; i < 2500; i++) {
    await knex('friends').insert([
      {
        user_id: randomFirstUser[i].id,
        friend_id: randomSecondUser[i].id,
      },
    ]);
  }

  console.log('Seeding friends.js has been finished!');
};
