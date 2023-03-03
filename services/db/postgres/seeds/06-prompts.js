const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed prompts.js entries...');
  const results = await knex('users').select('id');
  for (let i = 0; i < results.length; i++) {
    await knex('prompts').insert([
      {
        title: faker.random.words(5),
        subtitle: faker.random.words(10),
      },
    ]);
  }
  console.log('Seeding prompts.js has been finished!');
};
