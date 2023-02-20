import { test } from 'tap';
import faker from '@faker-js/faker';
import buildServer from '../../../index';

test('create and get user data', async t => {
  const fastify = buildServer();

  t.plan(4);

  t.teardown(() => {
    fastify.close();
    // For some reason, the process doesn't exit after the tests are done.
    process.exit(0);
  });

  const fakeUserPN = faker.phone.phoneNumber();

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
    .body({ phone_number: fakeUserPN });

  const registerResponseJson = registerResponse.json();

  t.equal(registerResponse.statusCode, 201, 'check signup payload');
  t.ok(registerResponseJson.access_token, 'check if access token exists');

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

  t.equal(updatedUserResponse.statusCode, 200, 'check updated user payload');
  t.hasProps(updatedUser, Object.keys(fakeUser), 'check if user has updated props');

  t.endAll();
});
