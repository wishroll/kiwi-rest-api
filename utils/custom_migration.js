const { readDB, writeDB } = require('../services/db/postgres/knex_fastify_plugin');
const { createDynamicProfileLink } = require('../services/api/google/firebase/dynamiclinks/index');

// We have a limit to 50 requests per minute
const limit = 50;

// Interval in ms
const interval = (60 / limit) * 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function customMigration() {
  let data = [{}];
  let firebaseError = false;

  while (data.length) {
    // Fetching new users group to update
    try {
      data = await readDB('users')
        .select([
          'id',
          'uuid',
          'display_name',
          'username',
          'phone_number',
          'created_at',
          'updated_at',
          'avatar_url',
        ])
        .whereNotNull('username')
        .whereNull('share_link')
        .orderBy('created_at', 'asc')
        .limit(1);

      console.log('data', data);

      console.log('found ', data.length, ' users to update');
    } catch (e) {
      console.log('could not fetch users ', e);
    }

    for (let i = 0; i < data.length; i++) {
      const userToUpdate = data[i];
      if (firebaseError) {
        // Simple throttle when we will receive some Firebase errors
        // 5 minutes
        await sleep(1000 * 60 * 5).then(() => {
          firebaseError = false;
        });
      }

      await sleep(interval).then(async () => {
        console.log('updating id: ', userToUpdate.id);
        try {
          //   const shareLink = 'test';
          const shareLink = await createDynamicProfileLink(userToUpdate);

          if (!shareLink) {
            firebaseError = true;
            throw new Error('Missing share link');
          }

          const data = await writeDB('users')
            .where({ id: userToUpdate.id })
            .update({ share_link: shareLink }, ['id', 'share_link']);

          if (!data[0].share_link) {
            throw new Error('Did not udpated share_link for user: ', userToUpdate.id);
          }

          console.log('updated successfully id: ', data[0].id);
        } catch (e) {
          console.log('something went wrong', e);
        }
      });
    }
  }

  console.log('finish');
  return 0;
}

customMigration();
