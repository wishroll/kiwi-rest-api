import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { RegisterUser, SignInUserSchema } from './auth.schema';

export async function registerUserHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: RegisterUser }>,
  res: FastifyReply,
) {
  try {
    const { phone_number } = req.body;
    const user = await this.prisma.user.create({ data: { phone_number } });
    const id = Number(user.id);
    const uuid = user.uuid;
    const token = this.jwt.sign({ id, uuid }, { expiresIn: '365 days' });
    res.status(201).send({ access_token: token });
  } catch (error) {
    res.status(500).send({ message: error });
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
    res.status(500).send();
  }
}
