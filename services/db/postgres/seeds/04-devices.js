const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  const getRandomDevice = () => {
    const random = Math.random();

    if (random < 0.3) return 'android';
    else if (random < 0.7) return 'ios';
    else return 'windows';
  };

  console.log('Starting to seed devices.js entries...');
  const results = await knex('users').select('id');
  for (let i = 0; i < results.length; i++) {
    await knex('devices').insert([
      {
        os: getRandomDevice(),
        token: faker.datatype.string(163), // Example of android's token
        user_id: results[i].id,
      },
    ]);
  }
  console.log('Seeding devices.js has been finished!');
};
