const schema = {
  type: 'object',
  required: [
    'PORT',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'VERIFY_SERVICE_ID',
    'AWS_S3_BUCKET_NAME',
    'AWS_S3_REGION',
    'AWS_S3_ACCESS_KEY_ID',
    'AWS_S3_SECRET_ACCESS_KEY',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'MASTER_KEY',
    'SPOTIFY_REDIRECT_URI',
    'SPOTIFY_AUTH_URI',
    'SPOTIFY_API_TOKEN_URI',
    'SPOTIFY_SCOPE',
    'APN_KEY_ID',
    'APN_TEAM_ID',
    'APN_KEY_PATH',
    'HOST',
    'NODE_ENV',
    'NEO4JUSERNAME',
    'NEO4JURI',
    'NEO4JPASSWORD',
    'AURA_INSTANCENAME',
  ],
  properties: {
    PORT: {
      type: 'integer',
    },
    TWILIO_ACCOUNT_SID: {
      type: 'string',
    },
    TWILIO_AUTH_TOKEN: {
      type: 'string',
    },
    VERIFY_SERVICE_ID: {
      type: 'string',
    },
    AWS_S3_BUCKET_NAME: {
      type: 'string',
    },
    AWS_S3_REGION: {
      type: 'string',
    },
    AWS_S3_ACCESS_KEY_ID: {
      type: 'string',
    },
    AWS_S3_SECRET_ACCESS_KEY: {
      type: 'string',
    },
    SPOTIFY_CLIENT_ID: {
      type: 'string',
    },
    SPOTIFY_CLIENT_SECRET: {
      type: 'string',
    },
    MASTER_KEY: {
      type: 'string',
    },
    SPOTIFY_REDIRECT_URI: {
      type: 'string',
    },
    SPOTIFY_AUTH_URI: {
      type: 'string',
    },
    SPOTIFY_API_TOKEN_URI: {
      type: 'string',
    },
    SPOTIFY_SCOPE: {
      type: 'string',
    },
    APN_KEY_ID: {
      type: 'string',
    },
    APN_TEAM_ID: {
      type: 'string',
    },
    APN_KEY_PATH: {
      type: 'string',
    },
    HOST: {
      type: 'string',
    },
    NODE_ENV: {
      type: 'string',
    },
    NEO4JUSERNAME: {
      type: 'string',
    },
    NEO4JURI: {
      type: 'string',
    },
    NEO4JPASSWORD: {
      type: 'string',
    },
    AURA_INSTANCENAME: {
      type: 'string',
    },
  },
};

export const options = {
  schema: schema,
  dotenv: true, // will read .env in root folder
};
