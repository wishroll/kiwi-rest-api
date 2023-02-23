const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed replies.js entries...');
  const randomMessage = await knex('messages')
    .select(['id', 'sender_id', 'recipient_id'])
    .orderByRaw('RANDOM()');

  for (let i = 0; i < 1500; i++) {
    await knex('replies').insert([
      {
        sender_id: randomMessage[i].recipient_id,
        recipient_id: randomMessage[i].sender_id,
        message_id: randomMessage[i].id,
        text: faker.random.words(5),
      },
    ]);
  }

  console.log('Seeding replies.js has been finished!');
};
