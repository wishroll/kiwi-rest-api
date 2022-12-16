import { mapLikeToScore } from '../../../algos/users/score_likes_mappers';
import logger from '../../../logger';
import { ForbiddenError } from '../../../utils/errors';
import { WishrollFastifyInstance } from '../../index';

export interface UpdateRatingAttributes {
  currentUserId: number;
  messageId: number;
  like: boolean;
}

export default (fastify: WishrollFastifyInstance) =>
  async ({ currentUserId, messageId, like }: UpdateRatingAttributes) =>
    fastify.writeDb.transaction(async trx => {
      const mappedScore = mapLikeToScore(like);

      const messageScore = await trx('ratings')
        .insert(
          {
            user_id: currentUserId,
            message_id: messageId,
            score: mappedScore,
            like: like,
          },
          '*',
        )
        .then(rows => rows[0]);

      logger(fastify).trace({ messageScore, currentUserId }, 'updated ratings table');

      if (messageScore === null || typeof messageScore !== 'object') {
        throw new Error('could not update message score/like');
      }

      const ratedMessage = await trx('messages').where({ id: messageId }).first();

      logger(fastify).trace({ ratedMessage }, 'message that will be rated');

      if (ratedMessage === null || typeof ratedMessage !== 'object') {
        throw new Error('could not find message to score/like');
      }

      if (Number(ratedMessage.recipient_id ?? '-1') !== Number(currentUserId)) {
        logger(fastify).info(
          {
            recipient_id: ratedMessage.recipient_id,
            currentUserId,
            recipient_id_type: typeof ratedMessage.recipient_id,
            currentUserId_type: typeof currentUserId,
          },
          'Recipient ID does not match current user ID',
        );
        throw new ForbiddenError('current user id does not match recipient_id');
      }

      await trx('user_ratings')
        .insert(
          {
            user_id: ratedMessage.sender_id,
            score: mappedScore,
            num_ratings: 1,
            likes: like ? 1 : 0,
          },
          ['*'],
        )
        .onConflict('user_id')
        .merge({
          num_ratings: trx.raw(':currentCount: + 1', {
            currentCount: 'user_ratings.num_ratings',
          }),
          score: trx.raw(
            '((:currentScore: * :currentCount:) + :newScore ) / (:currentCount: + 1)',
            {
              currentScore: 'user_ratings.score',
              currentCount: 'user_ratings.num_ratings',
              newScore: mappedScore,
            },
          ),
          likes: trx.raw(':currentLikes: + :newLike', {
            currentLikes: 'user_ratings.likes',
            newLike: like ? 1 : 0,
          }),
        });

      return ratedMessage;
    });
