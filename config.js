if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  const dotenv = require('dotenv');
  dotenv.config();
  module.exports = {
    port: process.env.PORT,
    environment: process.env.NODE_ENV,
    masterKey: process.env.MASTER_KEY,
  };
} else if (process.env.NODE_ENV === 'production') {
  module.exports = {
    port: process.env.PORT,
    environment: process.env.NODE_ENV,
    masterKey: process.env.MASTER_KEY,
  };
}
