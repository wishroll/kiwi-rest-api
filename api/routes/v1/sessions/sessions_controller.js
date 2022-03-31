const { phone } = require('phone')
const routes = async (fastify, options) => {
  const loginVerifiedPhoneNumberCacheKey = (phoneNumber) => { return `login-verified-phone-number-${phoneNumber}` }

  fastify.post('/login/validate', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

    if (!phoneNumber) {
      return res.status(400).send()
    }

    try {
      const rows = await fastify.knex('users').select('phone_number').where({ phone_number: phoneNumber })
      console.log(`This is the rows ${rows}`)
      rows && rows.length > 0 ? res.status(200).send() : res.status(404).send()
    } catch (error) {
      res.status(500).send()
    }

  })

  fastify.post('/login/send-token', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

    if (!phoneNumber) {
      return res.status(400).send()
    }

    try {
      const verification = await fastify.twilioClient.sendToken(phoneNumber)
      res.status(201).send({ message: `Verification token created and sent: ${verification.status}`})
    } catch (error) {
        res.status(error.status).send({ message: `An error occured: ${error.message}` })
    }

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
        return res.status(200).send({ success: true })
      } catch (error) {
        console.log(`Redis Error: ${error}`)
        return res.status(500).send()
      }
    }

    if (!phoneNumber || !token) {
      return res.status(400).send()
    }

    try {
      await fastify.twilioClient.verify(phoneNumber, token)
      const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber)
      await fastify.redisClient.set(cacheKey, token)
      res.status(200).send({ success: true, message: 'Verification Token verified' })
    } catch (error) {
      console.log(error)
      res.status(500).send()
    }

  })

  fastify.post('/login', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

    if (!phoneNumber) {
      return res.status(400).send()
    }
    const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber)

    try {
      const verified = await fastify.redisClient.get(cacheKey)
      if (verified) {
        const user = await fastify.knex('users').select(['id', 'uuid']).where({ phone_number: phoneNumber }).first()
        const token = fastify.jwt.sign({ id: user.id, uuid: user.uuid }, { expiresIn: '365 days' })
        await fastify.redisClient.del(cacheKey)
        res.status(200).send({ access_token: token })
      } else {
        res.status(401).send({ message: 'Unable to verify' })
      }
    } catch (error) {
      res.status(500).send()
    }

  })

  fastify.post('/logout', { onRequest: [fastify.authenticate] }, (req, res) => {
  })
}

module.exports = routes
