const routes = async (fastify, options) => {
    fastify.post('/prompts', { onRequest: [fastify.authenticate] }, (req, res) => {
        const title = req.body.title
        const subtitle = req.body.subtitle
        fastify.knex('prompts')
          .insert({ title: title, subtitle: subtitle }, ['id', 'uuid', 'created_at', 'updated_at'])
          .then((rows) => {
            if (rows.length > 0) {
              res.status(201).send(rows)
            } else {
              res.status(500).send({ error: 'Couldn\'t Create new prompt' })
            }
          })
          .catch((err) => {
            return res.status(500).send({ success: false, message: `An error occured: ${err}` })
          })
      })
      
      fastify.get('/prompts', async (req, res) => {
        try {
          const prompts = await fastify.knex('prompts').select()
          if (prompts.length > 0) {
            return res.status(200).send(prompts)
          } else {
            return res.status(404).send(prompts)
          }
        } catch (error) {
          return res.status(500).send(error)
        }
      })
      /**
       * Creates a new answer to a prompt
       */
      fastify.post('/prompts/:prompt_id/answers', { onRequest: [fastify.authenticate] }, async (req, res) => {
        // authenticate user before hand
        const userId = req.user.id
        const answer = req.body.answer
        const promptId = req.params.prompt_id
        try {
          const existingAnswer = await fastify.knex('answers')
            .select(['id', 'prompt_id', 'user_id'])
            .where({ user_id: userId, prompt_id: promptId })
            .first()
          if (existingAnswer) {
            const updatedAnswer = await fastify.knex('answers')
              .select('id')
              .where({ id: existingAnswer.id })
              .update({ body: answer }, ['id', 'uuid', 'body', 'created_at', 'updated_at', 'prompt_id', 'user_id'])
            return res.status(200).send(updatedAnswer)
          } else {
            const newAnswer = fastify.knex('answers')
              .insert()
          }
        } catch (error) {
          return res.status(500).send({ message: `An error occured ${error}` })
        }
      
        if (existingAnswer) {
          try {
          } catch (error) {
            return res.status(500).send({ message: `An error occured ${error}` })
          }
        } else {
          fastify.knex('answers')
            .insert({ body: answer, prompt_id: promptId, user_id: userId }, ['id', 'uuid', 'body', 'created_at', 'updated_at'])
            .then((rows) => {
              if (rows.length > 0) {
                return res.status(201).send(rows)
              } else {
                return res.status(500).send({ error: 'Couldn\'t Create new answer' })
              }
            })
            .catch((err) => {
              return res.status(500).send({ success: false, message: `An error occured: ${err}` })
            })
        }
      })
}

module.exports = routes