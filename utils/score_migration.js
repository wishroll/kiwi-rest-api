const { readDB, writeDB } = require('../services/db/postgres/knex_fastify_plugin');
const { mapScoreToLike } = require('../algos/users/score_likes_mappers');

const limit = 100;

async function customMigration() {
  let data = [{}];

  while (data.length) {
    // Fetching new score group to update
    console.time('mapping');
    try {
      data = await readDB('ratings').whereNotNull('score').whereNull('like').limit(limit);
      console.log(data, 'ratings');
    } catch (e) {
      console.log(e, 'could not fetch ratings ');
    }

    for (let i = 0; i < data.length; i++) {
      const scoreToUpdate = data[i];

      console.log(scoreToUpdate.id, 'updating id');

      const retVal = await writeDB('ratings')
        .where({ id: scoreToUpdate.id })
        .update({ like: mapScoreToLike(scoreToUpdate.score) }, ['id', 'like']);

      if (typeof retVal[0].like !== 'boolean') {
        const error = new Error('Did not udpated like for score: ', scoreToUpdate.id);
        console.log(error);
        throw error;
      }

      console.log(retVal[0].id, 'updated successfully id');
    }
    console.timeEnd('mapping');
  }

  console.log('finish');
  return 0;
}

customMigration();

// UPDATE ratings
// SET "like" = CASE
//   WHEN "score" < 0.5 THEN false
//   ELSE true
// END
