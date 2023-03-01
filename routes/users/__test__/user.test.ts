import { test } from 'tap';
import faker from '@faker-js/faker';
import buildServer from '../../../index';

test('create and get user data', async t => {
  const fastify = buildServer();

  t.teardown(() => {
    fastify.close();
    process.exit();
  });

  const userPhoneNumber = faker.phone.phoneNumber();

  const fakeUser = {
    display_name: faker.name.findName(),
    avatar_url: faker.internet.avatar(),
    username: faker.internet.userName(),
    bio: faker.lorem.sentence(),
    location: faker.address.city(),
  };

  const registerResponse = await fastify
    .inject()
    .post('/signup')
    .body({ phone_number: userPhoneNumber });

  const registerResponseJson = registerResponse.json();

  t.test('check signup payload', t => {
    t.equal(registerResponse.statusCode, 201);
    t.ok(registerResponseJson.access_token);
    t.end();
  });

  const { access_token } = registerResponseJson;

  const updatedUserResponse = await fastify
    .inject()
    .put('/users')
    .headers({
      Authorization: `Bearer ${access_token}}`,
    })
    .body({
      ...fakeUser,
    });

  const updatedUser = updatedUserResponse.json();

  t.test('check updated user payload', t => {
    t.equal(updatedUserResponse.statusCode, 200);
    t.hasProps(updatedUser, Object.keys(fakeUser));
    t.end();
  });
});
