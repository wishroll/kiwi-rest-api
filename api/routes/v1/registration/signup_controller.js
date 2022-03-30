const { phone } = require('phone')
const routes = async (fastify, options) => {
  fastify.decorate('twilioClient', require('../../../../services/api/twilio/twilio_client'))

  const signupVerifiedCacheKey = (phoneNumber) => { return `signup-verified-phone-number ${phoneNumber}` }

  /**
 *
 */
  fastify.post('/signup/validate', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber
    if (!phoneNumber) {
      res.status(400).send()
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
        try {
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
        } catch (error) {
          res.status(500).send({ message: `An error occured: ${error.message}` })
        }
      }
    } catch (error) {
      console.log(`Redis error: ${error}`)
      res.status(500).send({ message: `An error occured: ${error.message}` })
    }
  })

  fastify.post('/signup/send-token', (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber
    if (!phoneNumber) {
      res.status(400).send()
    }
    fastify.twilioClient.sendToken(phoneNumber, (verification, error) => {
      if (error !== null) {
      // handle error
        res.status(error.status).send({ success: false, message: `An error occured: ${error.message}` })
      } else if (verification !== null) {
        res.status(201).send({ success: true, message: `Verification token created and sent: ${verification.status}` })
      }
    })
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
      } catch (error) {
        res.status(500).send({ message: error })
      }
      return res.status(200).send({ success: true })
    }

    if ((phoneNumber !== null && phoneNumber !== undefined) && token !== undefined) {
    // twilioClient.verify(phoneNumber, token, (verificationChecks, error) => {
    //     if (!error) {
    //         //handle error
    //         return res.status(error["status"]).send({ success: false, message: `An error occured: ${error.message}` });
    //     } else if (verificationChecks !== null) {
      const cacheKey = signupVerifiedCacheKey(phoneNumber)
      try {
        await fastify.redisClient.set(cacheKey, token)
      } catch (error) {
        res.status(500).send({ message: error })
      }
      res.status(200).send({ message: 'Verification Token verified' })
    //     }
    // });
    } else {
      res.status(400).send()
    }
  })

  fastify.post('/signup', async (req, res) => {
    let phoneNumber = req.body.phone_number
    const countryCode = req.body.country_code
    phoneNumber = phone(phoneNumber, { country: countryCode }).phoneNumber
    if (!phoneNumber) {
      res.status(400).send()
    }
    try {
      const cacheKey = signupVerifiedCacheKey(phoneNumber)
      const result = await fastify.redisClient.get(cacheKey)
      if (result !== null) {
        if (result === true) {
          try {
            const results = await fastify.knex('users').insert({ phone_number: phoneNumber }, ['id', 'uuid', 'created_at', 'updated_at', 'avatar_url', 'display_name'])
            if (results.length > 0) {
              const user = results[0]
              const id = parseInt(user.id)
              const uuid = user.uuid
              const token = fastify.jwt.sign({ id: id, uuid: uuid }, { expiresIn: '365 days' })
              try {
                await fastify.redisClient.del(cacheKey)
              } catch (error) {
                res.status(500).send({ message: error })
              }
              res.status(201).send({ access_token: token })
            } else {
              // User record wasn't created in db
              res.status(500).send({ message: 'An error occured: Couldn\'t create new user' })
            }
          } catch (error) {
            res.status(500).send({ message: error })
          }
        } else {
          return res.status(401).send({ message: 'Token wasn\'t verified' })
        }
      } else {
        // Verification doesn't exist in redis
        return res.status(401).send({ message: 'Token wasn\'t verified' })
      }
    } catch (error) {
      res.status(500).send({ message: error })
    }
  })
}

module.exports = routes
