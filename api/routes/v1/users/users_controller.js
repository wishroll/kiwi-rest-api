const routes = async (fastify, options) => {
  const crypto = require('crypto')
  const multer = require('fastify-multer')
  const multerS3 = require('multer-s3')
  const S3 = require('aws-sdk/clients/s3')
  const s3 = new S3({ region: process.env.AWS_S3_REGION, credentials: { accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY } })
  const upload = multer({
    storage: multerS3({
      s3: s3,
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
    const SEPERATOR = "--";
    const digest = 'sha256';
    const hexDigest = crypto.createHash('sha256', process.env.MASTER_KEY).update(key).digest('hex');
    const base64Digest = crypto.createHash('sha256', process.env.MASTER_KEY).update(key).digest('base64Url');
    return `${base64Digest}${SEPERATOR}${hexDigest}`
};

  fastify.register(multer.contentParser)

  fastify.get('/users', (req, res) => {
    const limit = req.query.limit
    const offset = req.query.offset
    fastify.knex('users')
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('id', 'asc')
      .then((isAvailable) => {
        if (isAvailable.length > 0) {
          return res.status(200).send(isAvailable)
        } else {
          return res.status(404).send()
        }
      })
      .catch((err) => {
        return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
      })
  })

  /**
       * Returns a specific user
       */
  const response = { 200: { type: 'object', properties: { id: { type: 'number' }, uuid: { type: 'string' }, display_name: { type: 'string' }, created_at: { type: 'string' }, updated_at: { type: 'string' }, avatar_url: { type: 'string' } } } }
  fastify.get('/users/:id', { onRequest: [fastify.authenticate], schema: { response: response } }, (req, res) => {
    fastify.knex('users')
      .select('id', 'uuid', 'display_name', 'created_at', 'updated_at', 'avatar_url')
      .where({ id: req.params.id })
      .first()
      .then((user) => {
        if (user) {
          return res.status(200).send(user)
        } else {
          return res.status(404).send()
        }
      })
      .catch((err) => {
        console.error(err)
        return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
      })
  })

    fastify.put('/users', { onRequest: [fastify.authenticate], preHandler: upload.single('avatar') }, (req, res) => {
      const userId = req.user.id
      const updateParams = req.body
      if (req.file) {
        const key = req.file.key
        const hostName = req.hostname
        const signedId = createSignedId(key)
        const avatarUrl = `${req.protocol}://${hostName}/media/redirect/${signedId}/${key}`
        updateParams.avatar_url = avatarUrl
      }
      fastify.knex('users')
        .select('id')
        .where({ id: userId })
        .update(updateParams, ['id', 'uuid', 'display_name', 'phone_number', 'created_at', 'updated_at', 'avatar_url'])
        .then((rows) => {
          return res.status(200).send(rows)
        })
        .catch((err) => {
          console.error(err)
          return res.status(500).send({ success: false, message: 'An error occured' })
        })
    })
}

module.exports = routes
