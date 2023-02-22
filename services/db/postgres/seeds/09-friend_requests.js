exports.seed = async knex => {
  console.log('Starting to seed friend_requests.js entries...');

  const randomFirstUser = await knex('users').select(['id', 'phone_number']).orderByRaw('RANDOM()');
  const randomSecondUser = await knex('users')
    .select(['id', 'phone_number'])
    .orderByRaw('RANDOM()');

  for (let i = 0; i < 1500; i++) {
    await knex('friend_requests').insert([
      {
        requester_phone_number: randomFirstUser[i].phone_number,
        requested_phone_number: randomSecondUser[i].phone_number,
        requester_user_id: randomFirstUser[i].id,
        requested_user_id: randomSecondUser[i].id,
      },
    ]);
  }

  console.log('Seeding friend_requests.js has been finished!');
};
