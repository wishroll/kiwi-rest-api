const routes = async (fastify, _options) => {
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

  multer({
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

  fastify.register(multer.contentParser);

  const generateSignedUrl = key => {
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: 3000, // Signed url expires in five minutes
    });
  };

  fastify.get('/media/redirect/:signed_id/:filename', async (req, res) => {
    // const signedId = req.params.signed_id;

    const fileName = req.params.filename;
    const signedUrl = generateSignedUrl(fileName);
    return res.redirect(signedUrl);
  });
};

module.exports = routes;
