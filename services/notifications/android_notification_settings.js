const admin = require('firebase-admin');
const serviceAccount = require('./kiwi-b6082-firebase-adminsdk-vc9u2-6fc32e54ec.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin.messaging();
