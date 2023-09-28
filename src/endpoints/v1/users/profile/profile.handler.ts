import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UpdateProfileBody } from './profile.schema';
import { updateUserNode } from '../auth/util/neo4js';

export async function updateProfileHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: UpdateProfileBody }>,
  res: FastifyReply,
) {
  try {
    const { username, display_name } = req.body;
    const { id } = req.user;

    // Create a data object with only defined values
    const updateData = {
      username: username || undefined,
      display_name: display_name || undefined,
    };

    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).send({ error: 'No valid data to update' });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { username: true, display_name: true },
    });
    await updateUserNode(id, filteredUpdateData);

    return res.status(200).send(updatedUser);
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}
