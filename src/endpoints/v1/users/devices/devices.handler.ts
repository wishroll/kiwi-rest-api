import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateDeviceBody } from './devices.schema';
import { isDuplicateKeyError } from 'src/utils/errors';
import logger from 'src/utils/logger';

export async function createDeviceHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: CreateDeviceBody }>,
  res: FastifyReply,
) {
  const userId = req.user.id;
  const token = req.body.token;
  const os = req.body.os;
  try {
    const device = await this.prisma.device.create({ data: { user_id: userId, token, os } });
    res.status(200).send(device);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      logger(this).info(`Ignoring duplicate key conflict: ${(error as Error).message}`);
      res.status(200).send();
    } else {
      res.status(500).send(error);
    }
  }
}
