const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed replies.js entries...');
  const randomMessage = await knex('messages').select('id').orderByRaw('RANDOM()');

  for (let i = 0; i < 2500; i++) {
    const randomUsers = await knex('users').select('id').orderByRaw('RANDOM()').limit(2);

    await knex('replies').insert([
      {
        sender_id: randomUsers[0].id,
        recipient_id: randomUsers[1].id,
        message_id: randomMessage[i].id,
        text: faker.random.words(5),
      },
    ]);
  }

  console.log('Seeding replies.js has been finished!');
};
