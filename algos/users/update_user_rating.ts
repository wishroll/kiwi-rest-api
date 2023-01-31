import logger from '../../logger';
import { writeDB } from '../../services/db/postgres/knex_fastify_plugin';
import { mapScoreToLike } from './score_likes_mappers';

interface UserRating {
  user_id: number;
  score: number;
  num_ratings: number;
  likes: number;
}

const updateUserRating = async (userId: number, score: number): Promise<UserRating[] | Error> => {
  logger(null).debug(
    { userId, score },
    'This is the userId and score of user whom we are updating',
  );

  try {
    const result = await writeDB('user_ratings')
      .insert({ user_id: userId, score, num_ratings: 1 }, ['*'])
      .onConflict('user_id')
      .merge({
        num_ratings: writeDB.raw('?? + ?', ['user_ratings.num_ratings', 1]),
        score: writeDB.raw('((?? * ??) + ?) / (?? + ?)', [
          'user_ratings.score',
          'user_ratings.num_ratings',
          score,
          'user_ratings.num_ratings',
          1,
        ]),
        likes: writeDB.raw('?? + ?', ['user_ratings.likes', mapScoreToLike(score) ? 1 : 0]),
      });
    logger(null).debug({ result }, 'This is the result of inserting or updating a users rating');
    return result;
  } catch (err) {
    if (err instanceof Error) {
      logger(null).error(err, 'An error occured when updating user rating');
      return err;
    } else {
      return new Error('found error within updateUserRating function');
    }
  }
};

export { updateUserRating };
