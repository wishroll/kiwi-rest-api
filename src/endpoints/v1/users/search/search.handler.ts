import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import logger from 'src/utils/logger';
import { SearchUserQueryString } from './search.schema';

export async function searchUserHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Querystring: SearchUserQueryString }>,
  res: FastifyReply,
) {
  const { query, limit, offset } = req.query;

  if (!query || query.length < 1) {
    return res.status(400).send({ error: true, message: 'Missing Query' });
  }

  try {
    const users = await this.prisma.user.findMany({
      where: { username: { search: query } },
      take: limit,
      skip: offset,
    });
    return res.status(200).send(users);
  } catch (error) {
    if (error instanceof Error) {
      logger(req).error(error);
    } else {
      req.log.error(error);
    }
    return res.status(500).send({ error });
  }
}
