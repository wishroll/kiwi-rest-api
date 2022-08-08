const knex = require('../../services/db/postgres/knex_fastify_plugin');
// export function updateUserRating(userId, score) {
//     return knex('user_ratings').where({ user_id: userId }).first().increment({ num_ratings: 1 })
//         .then((rating) => {
//             knex('user_ratings').where({ id: rating.id }).update({ score: (rating.score / rating.num_ratings) })
//                 .then((result) => {
//                     return result
//                 })
//                 .catch((err) => {
//                     return err
//                 })
//         })
//         .catch((err) => {
//             return err
//         })
// }