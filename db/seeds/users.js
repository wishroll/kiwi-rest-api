/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {id: 1, display_name: 'Great okonkwo', phone_number: '+13474405562'},
    {id: 2, display_name: 'Blossom Okonkwo', phone_number: '+16462471839'},
    {id: 3, display_name: 'Fai Nur', phone_number: '+19174830432'}
  ]);
};
