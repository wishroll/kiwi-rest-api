exports.seed = async knex => {
  console.log('Starting to seed friend_requests.js entries...');

  const randomUserSet = await knex('users')
    .select(['id', 'phone_number'])
    .orderByRaw('RANDOM()');

  for (let i = 0; i < 1500; i++) {
    const randomSecondUser = await knex('users')
      .select(['id', 'phone_number'])
      .whereNot('id', randomUserSet[i].id)
      .orderByRaw('RANDOM()')
      .limit(1);

    await knex('friend_requests').insert([
      {
        requester_phone_number: randomUserSet[i].phone_number,
        requested_phone_number: randomSecondUser[0].phone_number,
        requester_user_id: randomUserSet[i].id,
        requested_user_id: randomSecondUser[0].id,
      },
    ]);
  }

  console.log('Seeding friend_requests.js has been finished!');
};
