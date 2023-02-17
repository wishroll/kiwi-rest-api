/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed answers.js entries...');
  const randomPrompt = await knex('prompts').select('id').orderByRaw('RANDOM()');
  const randomUser = await knex('users').select('id').orderByRaw('RANDOM()');

  for (let i = 0; i < 2500; i++) {
    await knex('answers').insert([
      {
        prompt_id: randomPrompt[i].id,
        user_id: randomUser[i].id,
        body: faker.lorem.paragraph(),
      },
    ]);
  }

  console.log('Seeding answers.js has been finished!');
};
