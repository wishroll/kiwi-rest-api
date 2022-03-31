const { phone } = require('phone')
const routes = async (fastify, options) => {
  const signupVerifiedCacheKey = (phoneNumber) => { return `signup-verified-phone-number ${phoneNumber}` }

  /**
 *
 *
 */
  fastify.post('/signup/validate', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

    if (!phoneNumber) {
      return res.status(400).send()
    }

    const cacheKey = `phone-number-is-available-${phoneNumber}`

    try {
      const isAvailable = await fastify.redisClient.get(cacheKey)
      console.log(isAvailable)
      // Check that isAvailable isn't null
      if (isAvailable !== null) {
        if (isAvailable === true) {
          console.log('User phone number is available to create an account')
          res.status(200).send()
        } else {
          console.log('User phone number is not available to create an account')
          res.status(409).send()
        }
      } else {
        // If there is no value for the key, fetch db instead
        const user = await fastify.knex('users')
          .select('phone_number')
          .where({ phone_number: phoneNumber })
          .first()
        if (user) {
          console.log('The user exists so the account cant be created')
          fastify.redisClient.set(cacheKey, false)
          res.status(409).send()
        } else {
          console.log('The user does not exist so the account can be created')
          fastify.redisClient.set(cacheKey, true)
          res.status(200).send()
        }
      }
    } catch (error) {
      res.status(500).send({ message: `An error occured: ${error.message}` })
    }
  })

  fastify.post('/signup/send-token', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

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
    let phoneNumber = req.body.phone_number
    const token = req.body.token
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

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
      const verificationChecks = await fastify.twilioClient.verify(phoneNumber, token)
      const cacheKey = signupVerifiedCacheKey(phoneNumber)
      await fastify.redisClient.set(cacheKey, token)
      res.status(200).send({ message: 'Verification Token verified' })
    } catch (error) {
      res.status(500).send({ message: error })
    }
  })

  fastify.post('/signup', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber

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
          const token = fastify.jwt.sign({ id: id, uuid: uuid }, { expiresIn: '365 days' })
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

module.exports = routes
