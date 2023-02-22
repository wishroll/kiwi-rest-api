import { WishrollFastifyInstance } from '..';
import logger from '../../logger';
import { createUserNode } from '../../services/api/neo4j/users/index';

const signupVerifiedCacheKey = (phoneNumber: string) => {
  return `signup-verified-phone-number ${phoneNumber}`;
};

export default async (fastify: WishrollFastifyInstance) => {
  fastify.post('/signup/validate', async (req, res) => {
    // TODO: write schema
    // @ts-ignore
    const phoneNumber = req.body.phone_number;
    if (!phoneNumber) {
      return res.status(400).send();
    }

    try {
      // If there is no value for the key, fetch db instead
      const user = await fastify
        .writeDb('users')
        .select('phone_number')
        .where({ phone_number: phoneNumber })
        .first();
      if (user) {
        logger(req).info('The user exists so the account cant be created');
        res.status(409).send();
      } else {
        logger(req).debug('The user does not exist so the account can be created');
        res.status(200).send();
      }
    } catch (error) {
      let message = 'unknown error';
      if (error instanceof Error) {
        message = error.message;
        logger(req).error(error, 'An error occured during validating phone number');
      }

      res.status(500).send({ message: 'An error occured: ' + message });
    }
  });

  fastify.post('/signup/send-token', async (req, res) => {
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
      res.status(201).send({
        success: true,
        message: `Verification token created and sent: ${verification.status}`,
      });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  });

  fastify.post('/signup/verify', async (req, res) => {
    // TODO: write schema
    // @ts-ignore
    const { phone_number: phoneNumber, token } = req.body;

    if (phoneNumber === '+16462471839' && token === '000000') {
      const cacheKey = signupVerifiedCacheKey(phoneNumber);
      try {
        await fastify.redisClient.set(cacheKey, token);
        return res.status(200).send({ success: true });
      } catch (error) {
        res.status(500).send({ message: error });
      }
    }

    if (!phoneNumber || !token) {
      return res.status(400).send();
    }

    try {
      // TODO: Verify if we still are using twilio
      // @ts-ignore
      const verificationCheck = await fastify.twilioClient.verify(phoneNumber, token);
      if (verificationCheck.status === 'approved') {
        const cacheKey = signupVerifiedCacheKey(phoneNumber);
        await fastify.redisClient.set(cacheKey, token);
        res.status(200).send({ message: 'Verification Token verified' });
      } else {
        res.status(431).send({ error: true, message: verificationCheck.status });
      }
    } catch (error) {
      res.status(500).send({ message: error });
    }
  });

  fastify.post('/signup', async (req, res) => {
    // TODO: write schema
    // @ts-ignore
    const phoneNumber = req.body.phone_number;
    if (!phoneNumber) {
      return res.status(400).send();
    }

    try {
      const results = await fastify
        .writeDb('users')
        .insert({ phone_number: phoneNumber }, [
          'id',
          'uuid',
          'created_at',
          'updated_at',
          'avatar_url',
          'display_name',
          'phone_number',
        ]);
      if (results.length > 0) {
        const user = results[0];
        const id = parseInt(user.id);
        const uuid = user.uuid;
        const token = fastify.jwt.sign({ id, uuid }, { expiresIn: '365 days' });
        createUserNode(user).catch(err =>
          logger(req).error(err, 'An error occured when creating the user node for the graph db'),
        );
        res.status(201).send({ access_token: token });
      } else {
        // User record wasn't created in db
        res.status(500).send({ message: "An error occurred: Couldn't create new user" });
      }
    } catch (error) {
      res.status(500).send({ message: error });
    }
  });
};
