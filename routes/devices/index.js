module.exports = async (fastify, options) => {
  const create = require('./schema/v1/create')
  fastify.post('/v1/devices', { onRequest: [fastify.authenticate], schema: create }, async (req, res) => {
    const userId = req.user.id
    const token = req.body.token
    const os = req.body.os
    try {
      /*
                Find device if it already exists
            */
      const currentDevices = await fastify.knex('devices').join('users', 'users.id', '=', 'devices.user_id').select(['devices.id as id', 'devices.token as token', 'devices.os as os']).where({ user_id: userId, os }) //Find the current user's devices for operating system
      if (currentDevices.length > 0) {
        let devicesToDelete = []
        let existingDevice = false
        currentDevices.forEach((d) => {
          if (d.token == token) {
            existingDevice = true
          } else {
            devicesToDelete.push(d)
          }
        })
        
        if (existingDevice) {
          // If Device already exists, return a 409 error letting the client know that the token already exists and a new one wasn't created
          return res.status(409).send({ error: true, message: `Device already exists with token: ${token}` })
        }

        if (devicesToDelete.length > 0) {
          await fastify.knex('devices').whereIn('id', devicesToDelete.map(d => d.id)).del() // delete devices that exist
          const insertedRecords = await fastify.knex('devices').insert({ token, os, user_id: userId }, ['*']) // Create new device with token
          if (insertedRecords.length > 0) {
            const createdDevice = insertedRecords[0]
            res.status(201).send(createdDevice)
          } else {
            res.status(500).send(error)
          }
        }
      } else {
        //If the user has no devices, 
        const insertedRecords = await fastify.knex('devices').insert({ token, os, user_id: userId }, ['*'])
        if (insertedRecords.length > 0) {
          const createdDevice = insertedRecords[0]
          res.status(201).send(createdDevice)
        } else {
          res.status(500).send(error)
        }
      }
      /*
            Insert new device with token, os, and userId
           */
    } catch (error) {
      res.status(500).send(error)
    }
  })
}
