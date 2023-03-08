const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed user_ratings.js entries...');
  const results = await knex('users').select('id');
  for (let i = 0; i < results.length; i++) {
    await knex('user_ratings').insert([
      {
        user_id: results[i].id,
        score: faker.datatype.float({ max: 1, precision: 0.001 }),
        num_ratings: faker.datatype.number({ max: 1000 }),
        likes: faker.datatype.number({ max: 10000 }),
      },
    ]);
  }
  console.log('Seeding user_ratings.js has been finished!');
};
