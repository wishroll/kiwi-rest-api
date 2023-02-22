const { faker } = require('@faker-js/faker');

exports.seed = async knex => {
  const constructShareLink = username => {
    return `https://kiwi-app.me/${username}`;
  };

  console.log('Starting to seed users.js entries...');
  for (let i = 0; i < 1500; i++) {
    const username = faker.datatype.string(15);
    await knex('users').insert([
      {
        display_name: faker.name.findName(),
        phone_number: faker.phone.phoneNumber(),
        avatar_url: faker.internet.avatar(),
        username,
        share_link: constructShareLink(username),
        bio: faker.random.words(5),
        location: faker.address.streetAddress(true),
      },
    ]);
  }

  console.log('Seeding users.js has been finished!');
};
