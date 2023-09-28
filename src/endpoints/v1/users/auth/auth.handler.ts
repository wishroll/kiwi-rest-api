import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  AuthenticatePhoneNumber,
  CheckOTPCode,
  RegisterUser,
  RetryOTP,
  SignInUserSchema,
  ValidateUserPhonenumber,
} from './auth.schema';
import { createUserNode } from './util/neo4js';

export async function registerUserHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: RegisterUser }>,
  res: FastifyReply,
) {
  try {
    const { phone_number } = req.body;
    const user = await this.prisma.user.create({ data: { phone_number } });
    await createUserNode(user);
    const id = Number(user.id);
    const uuid = user.uuid;
    const token = this.jwt.sign({ id, uuid }, { expiresIn: '365 days' });
    res.status(201).send({ access_token: token });
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function signInUserHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: SignInUserSchema }>,
  res: FastifyReply,
) {
  const { phone_number } = req.body;
  try {
    const user = await this.prisma.user.findFirst({
      where: { phone_number },
      select: { id: true, uuid: true },
    });
    if (user) {
      const token = this.jwt.sign(
        { id: Number(user.id), uuid: user.uuid },
        { expiresIn: '365 days' },
      );
      res.status(200).send({ access_token: token });
    } else {
      res.status(404).send({ error: 'Not Found' });
    }
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function authenticatePhoneNumberHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: AuthenticatePhoneNumber }>,
  res: FastifyReply,
) {
  const { phone_number: phoneNumber, device_id: deviceId, device_type: deviceType } = req.body;
  try {
    const auth = await this.dingClient.authenticate(phoneNumber, { deviceId, deviceType });
    res.status(200).send({ uuid: auth.uuid });
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function checkOTPCodeHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: CheckOTPCode }>,
  res: FastifyReply,
) {
  const { uuid, code } = req.body;
  try {
    const check = await this.dingClient.check(uuid, code);
    switch (check.status) {
      case 'valid' || 'already_validated':
        res.status(200).send();
        break;
      default:
        res.send(400).send({ error: true, message: check.status });
        break;
    }
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function retryOTPHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: RetryOTP }>,
  res: FastifyReply,
) {
  try {
    const { uuid } = req.body;
    const retry = await this.dingClient.retry(uuid);
    switch (retry.status) {
      case 'approved_retry':
        res.status(200).send();
        break;

      default:
        res.status(400).send();
        break;
    }
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function validateUserHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: ValidateUserPhonenumber }>,
  res: FastifyReply,
) {
  try {
    const { phone_number: phoneNumber } = req.body;
    const user = await this.prisma.user.findUnique({ where: { phone_number: phoneNumber } });

    if (user) {
      return res.status(200).send();
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}
