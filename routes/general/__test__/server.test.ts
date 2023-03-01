import { test } from 'tap';
import buildServer from '../../../index';

test('requests the `/healthcheck` route', async t => {
  const fastify = buildServer();

  t.teardown(() => {
    fastify.close();
    process.exit();
  });

  const response = await fastify.inject({
    method: 'GET',
    url: '/healthcheck',
  });

  t.equal(response.statusCode, 200);
  t.same(response.json(), { status: 'OK' });
});
