const { writeDB } = require('../../services/db/postgres/knex_fastify_plugin');
function updateUserRating(userId, score) {
    console.log('This is the user id of the user whom we are updating', userId, 'This is the score of the user whom we are updating', score)
   // writeDB.raw("((?? * ??) + ?) / (?? + ?)", ["user_ratings.score", "user_ratings.num_ratings", score, "user_ratings.num_ratings", 1])
    writeDB('user_ratings').insert({ user_id: userId, score: score, num_ratings: 1 }, ['*']).onConflict('user_id').merge({ num_ratings: writeDB.raw("?? + ?", ["user_ratings.num_ratings", 1]), score: score })
        .then((result) => {
            console.log('This is the result of inserting or updating a users rating', result)
            return result
        })
        .catch((err) => {
            console.log(err)
            return err
        })
}
module.exports = { updateUserRating }