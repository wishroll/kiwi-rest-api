const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed attachments.js entries...');
  const randomMessage = await knex('messages').select('id').orderByRaw('RANDOM()');

  for (let i = 0; i < 2500; i++) {
    await knex('attachments').insert([
      {
        name: faker.random.words(3),
        attachable_id: randomMessage[i].id,
        attachable_type: 'image',
      },
    ]);
  }

  console.log('Seeding attachments.js has been finished!');
};
