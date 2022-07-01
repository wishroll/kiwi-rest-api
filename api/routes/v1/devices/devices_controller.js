const routes = async (fastify, options) => {


    fastify.post('/v1/devices', {onRequest: [fastify.authenticate]}, async (req, res) => {
        const userId = req.user.id
        const token = req.body.token
        const os = req.body.os
        if(!token) {
            res.status(400).send({error: {message: 'Missing device token'}})
        }
        if(!os) {
            res.status(400).send({error: {message: "Missing device os"}})
        }
        try {
            /*
                Find device if it already exists
            */
           const currentDevice = await fastify.knex('devices').select('*').where({token: token}).first()
           if(currentDevice) {
               //If Device already exists, return a 409 error letting the client know that the token already exists and a new one wasn't created
               return res.status(409).send({error: {message: `Device already exists with token: ${token}`}})
           }
           /*
            Insert new device with token, os, and userId
           */
           const insertedRecords = await fastify.knex('devices').insert({token: token, os: os, user_id: userId}, ['*'])
           if(insertedRecords.length > 0) {
               const createdDevice = insertedRecords[0]
               res.status(201).send(createdDevice)
           }
        } catch (error) {
            res.status(500).send(error)
        }
    })









}
module.exports = routes