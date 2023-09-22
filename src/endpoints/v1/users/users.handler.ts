import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GetUserParam } from './users.schema';

export async function getUserHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Params: GetUserParam }>,
  res: FastifyReply,
) {
  try {
    // const { id: currentUserId } = req.user;
    const { id } = req.params;
    const user = await this.prisma.user.findUnique({ where: { id: parseInt(id) } });
    return res.status(200).send(user);
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}
