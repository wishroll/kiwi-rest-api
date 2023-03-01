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

  const removeUserResponse = await fastify
    .inject()
    .delete('/v1/users/me')
    .headers({
      Authorization: `Bearer ${access_token}`,
    });

  t.test('check remove user payload', t => {
    t.equal(removeUserResponse.statusCode, 204);
    t.same(removeUserResponse.json(), {
      error: false,
      message: 'user deleted',
    });
    t.end();
  });

  const userId = updatedUser.id;

  const deletedUserResponse = await fastify
    .inject()
    .get(`/v1/users/${userId}`)
    .headers({
      Authorization: `Bearer ${access_token}`,
    });

  t.test('check deleted user payload', async t => {
    t.equal(deletedUserResponse.statusCode, 404);
    t.same(deletedUserResponse.json(), {
      error: true,
      message: 'Not found',
    });
    t.end();
  });
});
