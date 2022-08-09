const { getHexCodeForScore } = require('../../algos/users/hex_code_for_score')

module.exports = async (fastify, options) => {
  const crypto = require('crypto')
  const multer = require('fastify-multer')
  const multerS3 = require('multer-s3')
  const S3 = require('aws-sdk/clients/s3')
  const s3 = new S3({ region: process.env.AWS_S3_REGION, credentials: { accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY } })
  const upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      cacheControl: 'max-age=31536000',
      contentDisposition: 'attachment',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + file.originalname)
      }
    })
  })

  const generateSignedUrl = (key) => {
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: 3000 // Signed url expires in five minutes
    })
  }

  const createSignedId = (key) => {
    const SEPERATOR = '--'
    const digest = 'sha256'
    const hexDigest = crypto.createHash('sha256', process.env.MASTER_KEY).update(key).digest('hex')
    const base64Digest = crypto.createHash('sha256', process.env.MASTER_KEY).update(key).digest('base64Url')
    return `${base64Digest}${SEPERATOR}${hexDigest}`
  }

  fastify.register(multer.contentParser)

  /**
       * Returns a specific user
       */
  const show = require('./schema/v1/show')
  fastify.get('/users/:id', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const userId = req.params.id;
    try {
      const user = await fastify.knex('users')
        .select(['id', 'uuid', 'display_name', 'created_at', 'updated_at', 'avatar_url', 'username'])
        .where({ id: userId })
        .first()
      if (user) {
        res.status(200).send(user)
      } else {
        res.status(404).send({ error: true, message: "Not found" })
      }
    } catch (error) {
      res.status(500).send({ error: true, message: error })
    }
  })

  fastify.get('/users/:id/tracks/sent', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const limit = req.query.limit
    const offset = req.query.offset
    const userId = req.params.id
    try {
      const tracks = await fastify.knex('spotify_tracks')

        .select(['spotify_tracks.id as id', 'spotify_tracks.name as name', 'spotify_tracks.created_at as created_at', 'spotify_tracks.updated_at as updated_at', 'spotify_tracks.uri as uri', 'spotify_tracks.track_number as track_number', 'spotify_tracks.track as track', 'spotify_tracks.type as type', 'spotify_tracks.preview_url as preview_url', 'spotify_tracks.popularity as popularity', 'spotify_tracks.is_local as is_local', 'spotify_tracks.href as href', 'spotify_tracks.explicit as explicit', 'spotify_tracks.episode as episode', 'spotify_tracks.duration_ms as duration_ms', 'spotify_tracks.disc_number as disc_number', 'spotify_tracks.available_markets as available_markets', 'spotify_tracks.album as album', 'spotify_tracks.artists as artists', 'spotify_tracks.external_ids as external_ids', 'spotify_tracks.external_urls as external_urls'])
        .join('messages', 'spotify_tracks.id', '=', 'messages.track_id')
        .where('messages.sender_id', '=', userId)
        .distinct('spotify_tracks.id')
        .orderBy('spotify_tracks.created_at', 'desc')
        .limit(limit)
        .offset(offset)
      if (tracks.length > 0) {
        res.status(200).send(tracks)
      } else {
        res.status(404).send()
      }
    } catch (error) {
      res.status(500).send({ error })
    }
  })

  fastify.put('/users', { onRequest: [fastify.authenticate], preHandler: upload.single('avatar') }, (req, res) => {
    const userId = req.user.id
    const updateParams = req.body
    if (req.file) {
      const key = req.file.key
      const hostName = req.hostname
      const signedId = createSignedId(key)
      let protocol = req.protocol
      if (!protocol.includes('s')) {
        // If the protocol isn't https, then append an 's' to the string
        protocol = protocol.concat('s')
      }
      const avatarUrl = `${protocol}://${hostName}/media/redirect/${signedId}/${key}`
      updateParams.avatar_url = avatarUrl
    }
    fastify.knex('users')
      .select('id')
      .where({ id: userId })
      .update(updateParams, ['id', 'uuid', 'display_name', 'username', 'phone_number', 'created_at', 'updated_at', 'avatar_url'])
      .then((rows) => {
        return res.status(200).send(rows)
      })
      .catch((err) => {
        console.error(err)
        return res.status(500).send({ success: false, message: 'An error occured' })
      })
  })


  /**
   * Version 1
   */

  fastify.get('/v1/users/:id', { onRequest: [fastify.authenticate], schema: show }, async (req, res) => {
    const userId = req.params.id;
    try {
      const user = await fastify.knex('users')
        .select(['id', 'uuid', 'display_name', 'created_at', 'updated_at', 'avatar_url', 'username'])
        .where({ id: userId })
        .first()
      const rating = await fastify.knex('user_ratings').where({ user_id: userId }).first()
      if (rating) {
        rating.hex_code = getHexCodeForScore(rating.score)
        user.rating = rating
      }
      if (user) {
        res.status(200).send(user)
      } else {
        res.status(404).send({ error: true, message: "Not found" })
      }
    } catch (error) {
      res.status(500).send({ error: true, message: error })
    }
  })






}
