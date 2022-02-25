const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  port: process.env.PORT,
  environment: process.env.NODE_ENV,
  masterKey: process.env.MASTER_KEY        
};