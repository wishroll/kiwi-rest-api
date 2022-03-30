const routes = async (fastify, options) => {
  /*

    */
  fastify.post('/questions', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const body = req.body.body
    const userId = req.user.id
    // Check that body param contains a value
    if (!body) {
      res.status(400).send()
    }
    try {
      const question = await fastify.knex('questions').insert({ body: body, user_id: userId }, ['id', 'uuid', 'body', 'created_at', 'updated_at'])
      res.status(201).send(question)
    } catch (error) {
      console.log(error)
      res.status(500).send()
    }
  })
  /*

    */
  fastify.get('/questions/:id', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const id = req.params.id
    try {
      const question = await fastify.knex('questions')
        .join('users', 'users.id', '=', 'questions.user_id')
        .select(['users.id as users_id', 'users.display_name as users_display_name', 'users.uuid as users_uuid', 'users.avatar_url as users_avatar_url', 'questions.id as questions_id', 'questions.uuid as questions_uuid', 'questions.body as questions_body', 'questions.created_at as questions_created_at', 'questions.updated_at as questions_updated_at'])
        .where('questions.id', '=', id)
        .first()
      if (question) {
        const data = { id: question.questions_id, uuid: question.questions_uuid, body: question.questions_body, created_at: question.questions_created_at, updated_at: question.questions_updated_at, user: { id: question.users_id, uuid: question.users_uuid, avatar_url: question.users_avatar_url, display_name: question.users_display_name } }
        res.status(200).send(data)
      } else {
        res.status(404).send()
      }
    } catch (error) {
      console.log(error)
      res.status(500).send()
    }
  })

  fastify.get('/questions', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const offset = req.query.offset || 0
    const limit = req.query.limit || 10
    try {
      const questions = await fastify.knex('questions')
        .join('users', 'users.id', '=', 'questions.user_id')
        .select(['users.id as users_id', 'users.display_name as users_display_name', 'users.uuid as users_uuid', 'users.avatar_url as users_avatar_url', 'questions.id as questions_id', 'questions.uuid as questions_uuid', 'questions.body as questions_body', 'questions.created_at as questions_created_at', 'questions.updated_at as questions_updated_at'])
        .orderByRaw('questions.created_at desc')
        .offset(offset)
        .limit(limit)
      if (questions.length > 0) {
        const data = questions.map((question) => {
          return { id: question.questions_id, uuid: question.questions_uuid, body: question.questions_body, created_at: question.questions_created_at, updated_at: question.questions_updated_at, user: { id: question.users_id, uuid: question.users_uuid, avatar_url: question.users_avatar_url, display_name: question.users_display_name } }
        })
        res.status(200).send(data)
      } else {
        res.status(404).send()
      }
    } catch (error) {
      console.log(error)
      res.status(500).send(error)
    }
  })
}

module.exports = routes
