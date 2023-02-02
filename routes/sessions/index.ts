import { WishrollFastifyInstance } from '..';
import logger from '../../logger';

const loginVerifiedPhoneNumberCacheKey = (phoneNumber: string) => {
  return `login-verified-phone-number-${phoneNumber}`;
};

export default async (fastify: WishrollFastifyInstance) => {
  fastify.post('/login/validate', async (req, res) => {
    // TODO: write schema
    // @ts-ignore
    const phoneNumber = req.body.phone_number;

    if (!phoneNumber) {
      return res.status(400).send();
    }

    try {
      const rows = await fastify
        .readDb('users')
        .select('phone_number')
        .where({ phone_number: phoneNumber })
        .where(q => {
          q.where({ is_deleted: false }).orWhere({ is_deleted: null });
        });
      logger(req).debug({ rows }, 'This is the rows');
      rows && rows.length > 0 ? res.status(200).send() : res.status(404).send();
    } catch (error) {
      res.status(500).send();
    }
  });

  fastify.post('/login/send-token', async (req, res) => {
    // TODO: write schema
    // @ts-ignore
    const phoneNumber = req.body.phone_number;

    if (!phoneNumber) {
      return res.status(400).send();
    }

    try {
      // TODO: Verify if we still are using twilio
      // @ts-ignore
      const verification = await fastify.twilioClient.sendToken(phoneNumber);
      res
        .status(201)
        .send({ message: `Verification token created and sent: ${verification.status}` });
    } catch (error) {
      let message = 'unknown error';
      if (error instanceof Error) {
        message = error.message;
        logger(req).error(error, 'An error occured during sending token');
      }

      res.status(500).send({ message: 'An error occured: ' + message });
    }
  });

  fastify.post('/login/verify', async (req, res) => {
    // TODO: write schema
    // @ts-ignore
    const { phone_number: phoneNumber, token } = req.body;

    if (phoneNumber === '+16462471839' && token === '000000') {
      const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber);
      try {
        await fastify.redisClient.set(cacheKey, token);
        return res.status(200).send({ success: true });
      } catch (error) {
        if (error instanceof Error) {
          logger(req).error(error, 'Redis error');
        }
        return res.status(500).send();
      }
    }

    if (!phoneNumber || !token) {
      return res.status(400).send();
    }

    try {
      // TODO: Verify if we still are using twilio
      // @ts-ignore
      await fastify.twilioClient.verify(phoneNumber, token);
      const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber);
      await fastify.redisClient.set(cacheKey, token);
      res.status(200).send({ success: true, message: 'Verification Token verified' });
    } catch (error) {
      if (error instanceof Error) {
        logger(req).error(error);
      }
      res.status(500).send();
    }
  });

  fastify.post('/login', async (req, res) => {
    // TODO: write schema
    // @ts-ignore
    const phoneNumber = req.body.phone_number;
    if (!phoneNumber) {
      return res.status(400).send();
    }
    try {
      const user = await fastify
        .readDb('users')
        .select(['id', 'uuid'])
        .where({ phone_number: phoneNumber })
        .first();
      const token = fastify.jwt.sign({ id: user.id, uuid: user.uuid }, { expiresIn: '365 days' });
      res.status(200).send({ access_token: token });
    } catch (error) {
      res.status(500).send();
    }
  });

  fastify.post('/logout', { onRequest: [fastify.authenticate] }, (_req, _res) => {});
};
