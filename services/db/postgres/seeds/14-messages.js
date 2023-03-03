const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed messages.js entries...');
  const randomUserSet = await knex('users').select('id').orderByRaw('RANDOM()');
  const randomTrack = await knex('tracks').select('track_id').orderByRaw('RANDOM()');

  const randomizeTrack = () => {
    return randomTrack[Math.floor(Math.random() * randomTrack.length)].track_id;
  };

  const randomizeLastSender = (index, firstUserIndex, secondUserIndex) => {
    const random = Math.random();

    if (random < 0.5) return firstUserIndex;
    else return secondUserIndex;
  };

  for (let i = 0; i < 1500; i++) {
    const randomSecondUser = await knex('users')
      .select('id')
      .whereNot('id', randomUserSet[i].id)
      .orderByRaw('RANDOM()')
      .limit(1);

    await knex('messages').insert([
      {
        sender_id: randomUserSet[i].id,
        recipient_id: randomSecondUser[0].id,
        track_id: randomizeTrack(),
        text: faker.random.words(5),
        seen: faker.datatype.boolean(),
        last_sender_id: randomizeLastSender(i, randomUserSet[i].id, randomSecondUser[0].id).id,
      },
    ]);
  }

  console.log('Seeding messages.js has been finished!');
};
