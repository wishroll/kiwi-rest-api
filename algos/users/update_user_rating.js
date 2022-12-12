const { default: logger } = require('../../logger');
const { writeDB } = require('../../services/db/postgres/knex_fastify_plugin');
const { mapScoreToLike } = require('./score_likes_mappers');
function updateUserRating(userId, score) {
  logger(null).debug(
    { userId, score },
    'This is the userId and score of user whom we are updating',
  );

  writeDB('user_ratings')
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
    })
    .then(result => {
      logger(null).debug({ result }, 'This is the result of inserting or updating a users rating');
      return result;
    })
    .catch(err => {
      logger(null).error(err, 'An error occured when updating user rating');
      return err;
    });
}
module.exports = { updateUserRating };
