import { WishrollFastifyInstance } from '../index';
import { IndexEmojiReactionsQueryString, indexEmojiReactionsSchema } from './schema/v1';
import { CreateEmojiReactionBody, createEmojiReactionSchema } from './schema/v1/create';
import { DeleteEmojiReactionParams, deleteEmojiReactionSchema } from './schema/v1/delete';
export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{ Querystring: IndexEmojiReactionsQueryString }>(
    '/v1/emoji_reactions',
    { onRequest: [fastify.authenticate], schema: indexEmojiReactionsSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const emojiReactionableType = req.query.type;
      const emojiReactionableId = req.query.id;
    },
  );

  fastify.post<{ Body: CreateEmojiReactionBody }>(
    '/v1/emoji_reactions',
    { onRequest: [fastify.authenticate], schema: createEmojiReactionSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;
      const emojiReactionableType = req.body.type;
      const emojiReactionableId = req.body.id;
      const emoji = req.body.emoji;
    },
  );

  fastify.delete<{ Params: DeleteEmojiReactionParams }>(
    '/v1/emoji_reactions/:id',
    { onRequest: [fastify.authenticate], schema: deleteEmojiReactionSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;
      const emojiReactionId = req.params.id;
    },
  );
};
