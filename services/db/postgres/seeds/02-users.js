const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  console.log('Starting to seed users.js entries...');
  for (let index = 0; index < 2500; index++) {
    await knex('users').insert([
      {
        display_name: faker.name.findName(),
        phone_number: faker.phone.phoneNumber('###-###-###'),
        avatar_url: faker.internet.avatar(),
        username: faker.datatype.string(15),
        share_link: faker.internet.url(),
        bio: faker.datatype.string(60),
        location: faker.address.streetAddress(true),
      },
    ]);
  }

  console.log('Seeding users.js has been finished!');
};
