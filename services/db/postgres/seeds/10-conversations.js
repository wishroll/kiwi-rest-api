exports.seed = async knex => {
  console.log('Starting to seed conversations.js entries...');

  for (let i = 0; i < 2500; i++) {
    await knex('conversations').insert([{}]);
  }

  console.log('Seeding conversations.js has been finished!');
};
