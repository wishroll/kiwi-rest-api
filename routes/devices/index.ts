import { WishrollFastifyInstance } from '../index';
import { CreateBody, create } from './schema/v1/create';
import { DeleteBody, delete_ } from './schema/v1/delete';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.post<{
    Body: CreateBody;
  }>('/v1/devices', { onRequest: [fastify.authenticate], schema: create }, async (req, res) => {
    // @ts-ignore
    const userId = req.user.id;

    const token = req.body.token;
    const os = req.body.os;
    try {
      const results = await fastify
        .writeDb('devices')
        .insert({ user_id: userId, token, os }, ['id'])
        .onConflict(['user_id', 'token'])
        .ignore();
      if (results) {
        res.status(200).send();
      } else {
        res.status(400).send({ error: true, message: 'Could not create a device!' });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });

  fastify.delete<{
    Body: DeleteBody;
  }>('/v1/devices', { onRequest: [fastify.authenticate], schema: delete_ }, async (req, res) => {
    // @ts-ignore
    const userId = req.user.id;
    const token = req.body.token;

    try {
      const result = await fastify
        .writeDb('devices')
        .delete()
        .where('user_id', userId)
        .andWhere('token', token);

      if (result) {
        res.status(204).send();
      } else {
        res.status(400).send({ error: true, message: 'Could not delete a device!' });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
};
