import dayjs from 'dayjs';
const { getHexCodeForScore } = require('../../algos/users/hex_code_for_score');
const { updateUserNode } = require('../../services/api/neo4j/users/index');
const {
  createDynamicProfileLink,
} = require('../../services/api/google/firebase/dynamiclinks/index');
const { default: logger } = require('../../logger');
module.exports = async (fastify, _options) => {
  const crypto = require('crypto');
  const multer = require('fastify-multer');
  const multerS3 = require('multer-s3');
  const S3 = require('aws-sdk/clients/s3');
  const s3 = new S3({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
  });
  const upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      cacheControl: 'max-age=31536000',
      contentDisposition: 'attachment',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + file.originalname);
      },
    }),
  });

  // eslint-disable-next-line no-unused-vars
  const generateSignedUrl = key => {
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: 3000, // Signed url expires in five minutes
    });
  };

  const createSignedId = key => {
    // const digest = 'sha256';

    const SEPERATOR = '--';
    const hexDigest = crypto.createHash('sha256', process.env.MASTER_KEY).update(key).digest('hex');
    const base64Digest = crypto
      .createHash('sha256', process.env.MASTER_KEY)
      .update(key)
      .digest('base64Url');
    return `${base64Digest}${SEPERATOR}${hexDigest}`;
  };

  fastify.register(multer.contentParser);

  /**
   * Returns a specific user
   */
  const show = require('./schema/v1/show');
  fastify.get('/users/:id', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const userId = req.params.id;
    try {
      const user = await fastify
        .readDb('users')
        .select([
          'id',
          'uuid',
          'display_name',
          'created_at',
          'updated_at',
          'avatar_url',
          'username',
          'bio',
          'location',
          'display_name_updated_at',
          'username_updated_at',
        ])
        .where({ id: userId })
        .first();

      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send({ error: true, message: 'Not found' });
      }
    } catch (error) {
      res.status(500).send({ error: true, message: error });
    }
  });

  /**
   * Checks the availability of a username
   */
  const checkUsername = require('./schema/v1/checkUsername');
  fastify.get(
    '/users/username',
    { onRequest: [fastify.authenticate], schema: checkUsername },
    async (req, res) => {
      const username = req.query.username;
      try {
        const existingUsername = await fastify
          .readDb('users')
          .select(['username'])
          .where({ username });

        if (existingUsername.length > 0) {
          res.status(400).send({ error: true, message: 'Username already taken' });
        } else {
          res.status(200).send({
            message: 'Username available',
          });
        }
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get('/users/:id/tracks/sent', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const userId = req.params.id;
    try {
      const tracks = await fastify
        .readDb('spotify_tracks')

        .select([
          'spotify_tracks.id as id',
          'spotify_tracks.name as name',
          'spotify_tracks.created_at as created_at',
          'spotify_tracks.updated_at as updated_at',
          'spotify_tracks.uri as uri',
          'spotify_tracks.track_number as track_number',
          'spotify_tracks.track as track',
          'spotify_tracks.type as type',
          'spotify_tracks.preview_url as preview_url',
          'spotify_tracks.popularity as popularity',
          'spotify_tracks.is_local as is_local',
          'spotify_tracks.href as href',
          'spotify_tracks.explicit as explicit',
          'spotify_tracks.episode as episode',
          'spotify_tracks.duration_ms as duration_ms',
          'spotify_tracks.disc_number as disc_number',
          'spotify_tracks.available_markets as available_markets',
          'spotify_tracks.album as album',
          'spotify_tracks.artists as artists',
          'spotify_tracks.external_ids as external_ids',
          'spotify_tracks.external_urls as external_urls',
        ])
        .join('messages', 'spotify_tracks.id', '=', 'messages.track_id')
        .where('messages.sender_id', '=', userId)
        .distinct('spotify_tracks.id')
        .orderBy('spotify_tracks.created_at', 'desc')
        .limit(limit)
        .offset(offset);
      if (tracks.length > 0) {
        res.status(200).send(tracks);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  fastify.put(
    '/users',
    { onRequest: [fastify.authenticate], preHandler: upload.single('avatar') },
    async (req, res) => {
      const userId = req.user.id;
      const updateParams = req.body;
      if (req.file) {
        const key = req.file.key;
        const hostName = req.hostname;
        const signedId = createSignedId(key);
        let protocol = req.protocol;
        if (!protocol.includes('s')) {
          // If the protocol isn't https, then append an 's' to the string
          protocol = protocol.concat('s');
        }
        const avatarUrl = `${protocol}://${hostName}/media/redirect/${signedId}/${key}`;
        updateParams.avatar_url = avatarUrl;
      }
      try {
        let updatedUser;

        // If updating display name, check if its been 7 days since last updated
        if (updateParams.display_name) {
          // Get the date when the display name was last updated
          const user = await fastify
            .readDb('users')
            .select(['display_name_updated_at'])
            .where({ id: userId });

          const date = user[0].display_name_updated_at;

          // ?Note: Date can be null as it was a newly added column
          // Check if the date is more than 7 days from last update
          if (date == null || dayjs().diff(dayjs(date), 'd') > 7) {
            // Update the time display name is updated
            updateParams.display_name_updated_at = dayjs().format('YYYY-MM-DD HH:mm:ssZ');
          } else {
            // Send an error if the name was updated within the last 7 days
            return res
              .status(400)
              .send({ error: true, message: 'The display name can only be updated every 7 days' });
          }
        }

        // If updating username, check if its been 30 days since last updated
        if (updateParams.username) {
          // Get the date when the display name was last updated
          const user = await fastify
            .readDb('users')
            .select(['username_updated_at'])
            .where({ id: userId });

          const date = user[0].username_updated_at;

          // ?Note: Date can be null as it was a newly added column
          // Check if the date is more than 30 days from last update
          if (date == null || dayjs().diff(dayjs(date), 'd') > 30) {
            // Update the time username is updated
            updateParams.username_updated_at = dayjs().format('YYYY-MM-DD HH:mm:ssZ');
          } else {
            // Send an error if the name was updated within the last 7 days
            return res
              .status(400)
              .send({ error: true, message: 'The username can only be updated every 30 days' });
          }
        }

        const results = await fastify
          .writeDb('users')
          .select('id')
          .where({ id: userId })
          .update(updateParams, [
            'id',
            'uuid',
            'display_name',
            'username',
            'phone_number',
            'created_at',
            'updated_at',
            'avatar_url',
            'share_link',
            'bio',
            'location',
            'display_name_updated_at',
            'username_updated_at',
          ]);

        updatedUser = results[0];

        if (updateParams.username) {
          try {
            const shareLink = await createDynamicProfileLink(updatedUser);
            const results = await fastify
              .writeDb('users')
              .select('id')
              .where({ id: userId })
              .update({ share_link: shareLink }, [
                'id',
                'uuid',
                'display_name',
                'username',
                'created_at',
                'updated_at',
                'avatar_url',
                'share_link',
                'bio',
                'location',
                'display_name_updated_at',
                'username_updated_at',
              ]);
            updatedUser = results[0];
          } catch (error) {
            logger(req).error(error, 'An error occured when updating the profile link');
          }
        }

        const rating = await fastify.readDb('user_ratings').where({ user_id: userId }).first();
        if (rating) {
          updatedUser.rating = rating;
        } else {
          const defaultScore = 0.1;
          updatedUser.rating = { score: defaultScore };
        }
        fastify.redisClient.set(
          `get-v1-users-${userId}`,
          JSON.stringify({ ...updatedUser, phone_number: undefined }),
          {
            EX: 60 * 30,
            KEEPTTL: true,
          },
        );

        updateUserNode(userId, updatedUser).catch(err =>
          logger(req).error(err, 'An error occured when updating a user node'),
        );

        res.status(200).send(updatedUser);
      } catch (error) {
        logger(req).error(error);
        res.status(500).send({ error: true, message: 'An error occured' });
      }
    },
  );

  /**
   * Version 1
   */

  fastify.get(
    '/v1/users/:id',
    { onRequest: [fastify.authenticate], schema: show },
    async (req, res) => {
      const userId = req.params.id;

      try {
        const user = await fastify
          .readDb('users')
          .select([
            'id',
            'uuid',
            'display_name',
            'created_at',
            'updated_at',
            'avatar_url',
            'username',
            'share_link',
            'bio',
            'location',
            'display_name_updated_at',
            'username_updated_at',
          ])
          .where({ id: userId })
          .first();

        if (user === undefined) {
          return res.status(404).send({ error: true, message: 'Not found' });
        }
        const rating = await fastify.readDb('user_ratings').where({ user_id: userId }).first();
        logger(null).debug(rating, 'rating');
        if (rating) {
          rating.hex_code = getHexCodeForScore(rating.score);
          user.rating = rating;
        } else {
          const defaultScore = 0.1;
          user.rating = {
            score: defaultScore,
            hex_code: getHexCodeForScore(defaultScore),
            likes: 0,
          };
        }
        if (user) {
          res.status(200).send(user);
        } else {
          res.status(404).send({ error: true, message: 'Not found' });
        }
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );
};
