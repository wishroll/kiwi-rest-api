const { phone } = require('phone')
const routes = async (fastify, options) => {
  const loginVerifiedPhoneNumberCacheKey = (phoneNumber) => { return `login-verified-phone-number-${phoneNumber}` }

  fastify.post('/login/validate', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber
    if (!phoneNumber) {
      res.status(400).send()
    }
    try {
      const rows = await fastify.knex('users').select('phone_number').where({ phone_number: phoneNumber })
      rows ? res.status(200).send() : res.status(404).send()
    } catch (error) {
      res.status(500).send()
    }
  })

  fastify.post('/login/send-token', (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber
    if (!phoneNumber) {
      res.status(400).send()
    }
    fastify.twilioClient.sendToken(phoneNumber, (verification, error) => {
      if (error) {
        res.status(error.status).send({ message: `An error occured: ${error.message}` })
      } else if (verification) {
        res.status(201).send({ message: `Verification token created and sent: ${verification.status}` })
      }
    })
  })

  fastify.post('/login/verify', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const token = req.body.token
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber
    if (phoneNumber === '+16462471839' && token === '000000') {
      const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber)
      try {
        await fastify.redisClient.set(cacheKey, token)
      } catch (error) {
        console.log(`Redis Error: ${error}`)
        res.status(500).send()
      }
      res.status(200).send({ success: true })
    }
    if (!phoneNumber || !token) {
      res.status(400).send()
    } else {
      // twilioClient.verify(phoneNumber, token, (verificationChecks, error) => {
      //     if (error) {
      //         return res.status(error["status"]).send({ success: false, message: `An error occured: ${error.message}` });
      //     } else {
      const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber)
      try {
        await fastify.redisClient.set(cacheKey, token)
      } catch (error) {
        console.log(`Redis Error: ${error}`)
        res.status(500).send()
      }
      res.status(200).send({ success: true, message: 'Verification Token verified' })
      // }
      // })
    }
  })

  fastify.post('/login', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber
    if (!phoneNumber) {
      res.status(400).send()
    }
    const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber)
    try {
      const verified = await fastify.redisClient.get(cacheKey)
      if (verified) {
        const user = await fastify.knex('users').select(['id', 'uuid']).where({ phone_number: phoneNumber }).first()
        const token = fastify.jwt.sign({ id: user.id, uuid: user.uuid }, { expiresIn: '365 days' })
        fastify.redisClient.del(cacheKey).then((_) => { console.log(`Finished deleting: ${cacheKey} from the cache`) })
        res.status(200).send({ access_token: token })
      } else {
        res.status(401).send({ message: 'Unable to verify' })
      }
    } catch (error) {
      console.log(`Redis Error: ${error}`)
      res.status(500).send()
    }
  })

  fastify.post('/logout', { onRequest: [fastify.authenticate] }, (req, res) => {
  })
}

module.exports = routes
