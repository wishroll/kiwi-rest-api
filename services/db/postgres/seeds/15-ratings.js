const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed ratings.js entries...');
  const receivedMessages = await knex('messages')
    .select(['id', 'recipient_id'])
    .orderByRaw('RANDOM()');

  for (let i = 0; i < 1500; i++) {
    await knex('ratings').insert([
      {
        user_id: receivedMessages[i].recipient_id,
        message_id: receivedMessages[i].id,
        score: faker.datatype.float({ max: 1, precision: 0.001 }),
        like: faker.datatype.boolean(),
      },
    ]);
  }

  console.log('Seeding ratings.js has been finished!');
};
