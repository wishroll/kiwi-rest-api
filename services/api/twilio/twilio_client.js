const twilio = require('twilio')
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const serviceId = process.env.VERIFY_SERVICE_ID
const client = twilio(accountSid, authToken)
exports.sendToken = (phoneNumber) => {
  return new Promise((resolve, reject) => {
    client.verify
      .services(serviceId)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' })
      .then((verification) => {
        resolve(verification)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

exports.verify = (phoneNumber, token) => {
  return new Promise((resolve, reject) => {
    client.verify.services(serviceId)
      .verificationChecks
      .create({ to: phoneNumber, code: token })
      .then((verificationCheck) => {
        resolve(verificationCheck)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
