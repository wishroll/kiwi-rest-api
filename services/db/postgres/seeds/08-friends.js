exports.seed = async knex => {
  console.log('Starting to seed friends.js entries...');
  const randomUserSet = await knex('users').select('id').orderByRaw('RANDOM()');

  for (let i = 0; i < 1500; i++) {
    const randomSecondUser = await knex('users')
      .select('id')
      .whereNot('id', randomUserSet[i].id)
      .orderByRaw('RANDOM()')
      .limit(1);

    await knex('friends').insert([
      {
        user_id: randomUserSet[i].id,
        friend_id: randomSecondUser[0].id,
      },
    ]);
  }

  console.log('Seeding friends.js has been finished!');
};
