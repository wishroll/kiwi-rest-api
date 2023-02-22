const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed messages.js entries...');
  const randomFirstUser = await knex('users').select('id').orderByRaw('RANDOM()');
  const randomSecondUser = await knex('users').select('id').orderByRaw('RANDOM()');
  const randomTrack = await knex('tracks').select('track_id').orderByRaw('RANDOM()');

  const randomizeTrack = () => {
    return randomTrack[Math.floor(Math.random() * randomTrack.length)].track_id;
  };

  const randomizeLastSender = index => {
    const random = Math.random();

    if (random < 0.5) return randomFirstUser[index];
    else return randomSecondUser[index];
  };

  for (let i = 0; i < 1500; i++) {
    await knex('messages').insert([
      {
        sender_id: randomFirstUser[i].id,
        recipient_id: randomSecondUser[i].id,
        track_id: randomizeTrack(),
        text: faker.random.words(5),
        seen: faker.datatype.boolean(),
        last_sender_id: randomizeLastSender(i).id,
      },
    ]);
  }

  console.log('Seeding messages.js has been finished!');
};
