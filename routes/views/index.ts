import { WishrollFastifyInstance } from '../index';
import { CreateViewBody, createViewSchema } from './schema/v1/create';
export default async (fastify: WishrollFastifyInstance) => {
  fastify.post<{ Body: CreateViewBody }>(
    '/v1/views',
    { onRequest: [fastify.authenticate], schema: createViewSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

    //   const viewableId = req.body.id;
    //   const viewableType = req.body.type;
      try {
        res.status(200).send();
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );
};
