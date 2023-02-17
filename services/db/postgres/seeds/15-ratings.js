const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed ratings.js entries...');
  const randomUser = await knex('users').select('id').orderByRaw('RANDOM()');
  const randomMessage = await knex('messages').select('id').orderByRaw('RANDOM()');

  for (let i = 0; i < 2500; i++) {
    await knex('ratings').insert([
      {
        user_id: randomUser[i].id,
        message_id: randomMessage[i].id,
        score: faker.datatype.float({ max: 1, precision: 0.001 }),
        like: faker.datatype.boolean(),
      },
    ]);
  }

  console.log('Seeding ratings.js has been finished!');
};
