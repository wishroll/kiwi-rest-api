const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.VERIFY_SERVICE_ID; 
const client = twilio(accountSid, authToken);
exports.sendToken = (phoneNumber, callback) => {    
    client.verify
            .services(serviceId)
             .verifications
             .create({to: phoneNumber, channel: 'sms'})
             .then( (verification) => {
                callback(verification, null);
             }, (error) => {
                 callback(null, error);
             })
};
exports.verify = (phoneNumber, token, callback) => {
    client.verify.services(serviceId)
      .verificationChecks
      .create({to: phoneNumber, code: token})
      .then((verification_check) => {
        callback(verification_check, null);
      }, (error) => {callback(null, error);});
};