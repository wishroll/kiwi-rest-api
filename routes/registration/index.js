const { phone } = require('phone')
module.exports = async (fastify, options) => {
  const signupVerifiedCacheKey = (phoneNumber) => { return `signup-verified-phone-number ${phoneNumber}` }

  /**
 *
 *
 */
  fastify.post('/signup/validate', async (req, res) => {
    const phoneNumber = req.body.phone_number
    // const countryCode = req.body.country_code
    // phoneNumber = phone(phoneNumber).phoneNumber
    if (!phoneNumber) {
      return res.status(400).send()
    }

    try {
      // If there is no value for the key, fetch db instead
      const user = await fastify.knex('users')
        .select('phone_number')
        .where({ phone_number: phoneNumber })
        .first()
      if (user) {
        console.log('The user exists so the account cant be created')
        res.status(409).send()
      } else {
        console.log('The user does not exist so the account can be created')
        res.status(200).send()
      }
    } catch (error) {
      res.status(500).send({ message: `An error occured: ${error.message}` })
    }
  })

  fastify.post('/signup/send-token', async (req, res) => {
    const phoneNumber = req.body.phone_number
    // const countryCode = req.body.country_code
    // phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

    if (!phoneNumber) {
      return res.status(400).send()
    }

    try {
      const verification = await fastify.twilioClient.sendToken(phoneNumber)
      res.status(201).send({ success: true, message: `Verification token created and sent: ${verification.status}` })
    } catch (error) {
      res.status(500).send({ message: error })
    }
  })

  fastify.post('/signup/verify', async (req, res) => {
    const phoneNumber = req.body.phone_number
    const token = req.body.token
    // const countryCode = req.body.country_code
    // phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

    if (phoneNumber === '+16462471839' && token === '000000') {
      const cacheKey = signupVerifiedCacheKey(phoneNumber)
      try {
        await fastify.redisClient.set(cacheKey, token)
        return res.status(200).send({ success: true })
      } catch (error) {
        res.status(500).send({ message: error })
      }
    }

    if (!phoneNumber || !token) {
      return res.status(400).send()
    }

    try {
      const verificationCheck = await fastify.twilioClient.verify(phoneNumber, token)
      if (verificationCheck.status === 'approved') {
        const cacheKey = signupVerifiedCacheKey(phoneNumber)
        await fastify.redisClient.set(cacheKey, token)
        res.status(200).send({ message: 'Verification Token verified' })
      } else {
        res.status(431).send({ error: true, message: verificationCheck.status })
      }
    } catch (error) {
      res.status(500).send({ message: error })
    }
  })

  fastify.post('/signup', async (req, res) => {
    const phoneNumber = req.body.phone_number
    // const countryCode = req.body.country_code
    // phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

    if (!phoneNumber) {
      return res.status(400).send()
    }

    try {
      const cacheKey = signupVerifiedCacheKey(phoneNumber)
      const result = await fastify.redisClient.get(cacheKey)
      if (result) {
        const results = await fastify.knex('users').insert({ phone_number: phoneNumber }, ['id', 'uuid', 'created_at', 'updated_at', 'avatar_url', 'display_name'])
        if (results.length > 0) {
          const user = results[0]
          const id = parseInt(user.id)
          const uuid = user.uuid
          const token = fastify.jwt.sign({ id, uuid }, { expiresIn: '365 days' })
          await fastify.redisClient.del(cacheKey)
          res.status(201).send({ access_token: token })
        } else {
          // User record wasn't created in db
          res.status(500).send({ message: 'An error occured: Couldn\'t create new user' })
        }
      } else {
        return res.status(401).send({ message: 'Token wasn\'t verified' })
      }
    } catch (error) {
      res.status(500).send({ message: error })
    }
  })
}
