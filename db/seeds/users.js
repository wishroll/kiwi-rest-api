/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const {faker} = require('@faker-js/faker');
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  // await knex('users').del()
  for (let index = 0; index < 1000000; index++) {
    await knex('users').insert([{display_name: faker.internet.userName(), phone_number: faker.phone.phoneNumber("+1##########")}]);
  }
};
