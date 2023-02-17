const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed questions.js entries...');
  const results = await knex('users').select('id');
  for (let i = 0; i < results.length; i++) {
    await knex('questions').insert([
      {
        user_id: results[i].id,
        body: faker.lorem.paragraph(1),
      },
    ]);
  }
  console.log('Seeding questions.js has been finished!');
};
