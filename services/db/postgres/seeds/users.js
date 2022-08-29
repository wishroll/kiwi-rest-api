/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { faker } = require('@faker-js/faker');
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  // await knex('users').del()
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }
  for (let index = 0; index < 1000000; index++) {
    await knex('answers').insert([
      {
        prompt_id: getRandomInt(1, 3),
        user_id: getRandomInt(7000, 100_000),
        body: faker.lorem.paragraph(),
      },
    ]);
  }
};
