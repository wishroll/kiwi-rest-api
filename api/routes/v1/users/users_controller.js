const routes = async (fastify, options) => {
    fastify.get('/users', (req, res) => {
        const limit = req.query.limit
        const offset = req.query.offset
        fastify.knex('users')
          .select('*')
          .limit(limit)
          .offset(offset)
          .orderBy('id', 'asc')
          .then((isAvailable) => {
            if (isAvailable.length > 0) {
              return res.status(200).send(isAvailable)
            } else {
              return res.status(404).send()
            }
          })
          .catch((err) => {
            return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
          })
      })
      
      /**
       * Returns a specific user
       */
      const response = { 200: { type: 'object', properties: { id: { type: 'number' }, uuid: { type: 'string' }, display_name: { type: 'string' }, created_at: { type: 'string' }, updated_at: { type: 'string' }, avatar_url: { type: 'string' } } } }
      fastify.get('/users/:id', { onRequest: [fastify.authenticate], schema: { response: response } }, (req, res) => {
        fastify.knex('users')
          .select('id', 'uuid', 'display_name', 'created_at', 'updated_at', 'avatar_url')
          .where({ id: req.params.id })
          .first()
          .then((user) => {
            if (user) {
              return res.status(200).send(user)
            } else {
              return res.status(404).send()
            }
          })
          .catch((err) => {
            console.error(err)
            return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
          })
      })

    //   fastify.put('/users', { onRequest: [fastify.authenticate], preHandler: upload.single('avatar') }, (req, res) => {
    //     const userId = req.user.id
    //     const updateParams = req.body
    //     if (req.file) {
    //       const key = req.file.key
    //       const hostName = req.hostname
    //       const signedId = createSignedId(key)
    //       const avatarUrl = `${req.protocol}://${hostName}/media/redirect/${signedId}/${key}`
    //       updateParams.avatar_url = avatarUrl
    //     }
    //     fastify.knex('users')
    //       .select('id')
    //       .where({ id: userId })
    //       .update(updateParams, ['id', 'uuid', 'display_name', 'phone_number', 'created_at', 'updated_at', 'avatar_url'])
    //       .then((user) => {
    //         return res.status(200).send(user)
    //       })
    //       .catch((err) => {
    //         console.error(err)
    //         return res.status(500).send({ success: false, message: 'An error occured' })
    //       })
    //   })
}

module.exports = routes