import { test } from 'tap';
import buildServer from '../../../index';
import { prepareFakeUser } from '../../../utils/testing';

const setupTests = async (t: Tap.Test, isLastTest = false) => {
  const fastify = buildServer();
  t.teardown(() => {
    fastify.close();
    if (isLastTest) process.exit();
  });

  const { access_token } = await prepareFakeUser(fastify);

  return { fastify, access_token, device_token: 'test_token' };
};

test('register and delete device', async t => {
  const { fastify, access_token, device_token } = await setupTests(t);

  const createdDeviceResponse = await fastify
    .inject()
    .post('/v1/devices')
    .headers({
      Authorization: `Bearer ${access_token}}`,
    })
    .body({
      os: 'android',
      token: device_token,
    });

  await t.test('check register payload', t => {
    t.equal(createdDeviceResponse.statusCode, 200);
    t.end();
  });

  const removedDeviceResponse = await fastify
    .inject()
    .delete('/v1/devices')
    .headers({
      Authorization: `Bearer ${access_token}}`,
    })
    .body({
      token: device_token,
    });

  await t.test('check delete payload', t => {
    t.equal(removedDeviceResponse.statusCode, 204);
    t.end();
  });
});

test('Delete device with incorrect params', async t => {
  const { fastify, access_token, device_token } = await setupTests(t, true);

  const removedDeviceResponse = await fastify
    .inject()
    .delete('/v1/devices')
    .headers({
      Authorization: `Bearer ${access_token}}`,
    })
    .body({
      token: device_token,
    });

  const removedDeviceJson = removedDeviceResponse.json();

  await t.test('check delete payload', t => {
    t.equal(removedDeviceResponse.statusCode, 400);
    t.ok(removedDeviceJson.error);
    t.equal(removedDeviceJson.message, 'Could not delete a device!');
    t.end();
  });
});
