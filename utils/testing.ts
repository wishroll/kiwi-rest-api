import { FastifyInstance } from 'fastify';
import faker from '@faker-js/faker';

export const prepareFakeUser = async (fastify: FastifyInstance) => {
  const phoneNumber = faker.phone.phoneNumber();

  const registerResponse = await fastify
    .inject()
    .post('/signup')
    .body({ phone_number: phoneNumber });
  const { access_token } = registerResponse.json();

  const fakeUser = {
    display_name: faker.name.findName(),
    avatar_url: faker.internet.avatar(),
    username: faker.internet.userName(),
    bio: faker.lorem.sentence(),
    location: faker.address.city(),
  };

  const createdUserResponse = await fastify
    .inject()
    .put('/users')
    .headers({
      Authorization: `Bearer ${access_token}}`,
    })
    .body({
      ...fakeUser,
    });

  const createdUser = createdUserResponse.json();

  return { createdUser, access_token };
};
