import { test } from 'tap';
import faker from '@faker-js/faker';
import buildServer from '../../../index';
test('create and get user data', async t => {
  const fastify = buildServer();

  t.teardown(() => {
    fastify.close();
  });

  const fakeUserPN = faker.phone.phoneNumber();

  const fakeUser = {
    uuid: faker.datatype.uuid(),
    display_name: faker.name.findName(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    avatar_url: faker.internet.avatar(),
    username: faker.internet.userName(),
    bio: faker.lorem.sentence(),
    location: faker.address.city(),
    display_name_updated_at: faker.date.recent(),
    username_updated_at: faker.date.recent(),
  };

  const registerResponse = await fastify.inject({
    method: 'POST',
    url: '/signup',
    payload: {
      phone_number: fakeUserPN,
    },
  });

  t.equal(registerResponse.statusCode, 201);

  const registerResponseJson = registerResponse.json();

  t.hasProp(registerResponseJson, 'access_token');

  const { access_token } = registerResponseJson;

  const updatedUserResponse = await fastify.inject({
    method: 'PUT',
    url: '/users',
    headers: {
      Authorization: `Bearer ${access_token}}`,
    },
    payload: {
      ...fakeUser,
    },
  });

  const updatedUser = updatedUserResponse.json();

  t.hasProps(updatedUser, Object.keys(fakeUser));

  const response = await fastify.inject({
    method: 'GET',
    url: `/users/${updatedUser.id}`,
    headers: {
      Authorization: `Bearer ${access_token}}`,
    },
  });

  t.equal(response.statusCode, 200);

  t.same(response.json(), fakeUser);
});
