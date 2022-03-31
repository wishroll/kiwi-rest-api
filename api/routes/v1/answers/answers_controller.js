const routes = async (fastify, options) => {
  /**
 * Returns a users answers to various prompts
 */
  fastify.get('/users/:user_id/answers', { onRequest: [fastify.authenticate] }, (req, res) => {
    const limit = req.query.limit
    const offset = req.query.offset
    fastify.knex('answers')
      .join('prompts', 'answers.prompt_id', '=', 'prompts.id')
      .join('users', 'answers.user_id', '=', 'users.id')
      .select(['answers.id as answer_id', 'answers.uuid as answer_uuid', 'answers.created_at as answer_created_at', 'answers.updated_at as answer_updated_at', 'answers.body as answer_body', 'prompts.id as prompt_id', 'prompts.uuid as prompt_uuid', 'prompts.title as prompt_title', 'prompts.subtitle as prompt_subtitle', 'prompts.created_at as prompt_created_at', 'users.id as user_id', 'users.uuid as user_uuid', 'users.display_name as user_display_name', 'users.avatar_url as user_avatar_url'])
      .where({ user_id: req.params.user_id })
      .limit(limit)
      .offset(offset)
      .orderBy('prompts.id', 'asc')
      .then((rows) => {
        if (rows.length > 0) {
          const data = []
          rows.forEach(row => {
            data.push({ id: row.answer_id, uuid: row.answer_uuid, created_at: row.answer_created_at, updated_at: row.answer_updated_at, body: row.answer_body, prompt: { id: row.prompt_id, uuid: row.prompt_uuid, title: row.prompt_title, subtitle: row.prompt_subtitle, created_at: row.prompt_created_at }, user: { id: row.user_id, uuid: row.user_uuid, display_name: row.user_display_name, avatar_url: row.user_avatar_url } })
          })
          return res.status(200).send(data)
        } else {
          return res.status(404).send()
        }
      })
      .catch((err) => {
        console.log(err)
        return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
      })
  })

  const createSignedId = (key) => {
    const SEPERATOR = '--'
    const digest = 'sha256'
    const hexDigest = crypto.createHash('sha256', masterKey).update(key).digest('hex')
    const base64Digest = crypto.createHash('sha256', masterKey).update(key).digest('base64Url')
    return `${base64Digest}${SEPERATOR}${hexDigest}`
  }

  /**
   * Updates the answer for a specified prompt
   *
   */
  fastify.put('/answers/:id', { onRequest: [fastify.authenticate] }, (req, res) => {
    const answerId = req.params.id
    const updates = req.body
    fastify.knex('answers')
      .where({ id: answerId })
      .update(updates, ['id', 'uuid', 'body', 'created_at', 'updated_at'])
      .then(() => {
        return res.status(200).send()
      })
      .catch((error) => {
        return res.status(500).send({ success: false, message: 'An error occured' })
      })
  })

  /**
   * Returns a specific answer to a specific prompt
   */
  fastify.get('/prompts/:prompt_id/answers/:id', { onRequest: [fastify.authenticate] }, (req, res) => {
    const promptId = req.params.prompt_id
    const id = req.params.id
    fastify.knex('answers')
      .join('users', 'answers.user_id', '=', 'users.id')
      .join('prompts', 'answers.prompt_id', '=', 'prompts.id')
      .select(['answers.id as answer_id', 'answers.uuid as answer_uuid', 'answers.created_at as answer_created_at', 'answers.updated_at as answer_updated_at', 'answers.body as answer_body', 'prompts.id as prompt_id', 'prompts.uuid as prompt_uuid', 'prompts.body as prompt_body', 'prompts.created_at as prompt_created_at', 'users.id as user_id', 'users.uuid as user_uuid', 'users.display_name as user_display_name', 'users.avatar_url as user_avatar_url'])
      .where('answers.id', '=', id)
      .limit(1)
      .then((rows) => {
        if (rows.length > 0) {
          const row = rows[0]
          const data = { id: row.answer_id, uuid: row.answer_uuid, created_at: row.answer_created_at, updated_at: row.answer_updated_at, body: row.answer_body, prompt: { id: row.prompt_id, uuid: row.prompt_uuid, body: row.prompt_body, created_at: row.prompt_created_at }, user: { id: row.user_id, uuid: row.user_uuid, display_name: row.user_display_name, avatar_url: row.user_avatar_url } }
          console.log(data)
          return res.status(200).send(data)
        } else {
          return res.status(404).send()
        }
      })
      .catch((err) => {
        console.error(err)
        return res.status(500).send({ success: false, message: 'An error occured' })
      })
  })

  fastify.get('/answers', { onRequest: [fastify.authenticate] }, (req, res) => {
    const limit = 100
    const offset = req.query.offset
    const currentUserId = req.user.id
    fastify.knex('answers')
      .join('prompts', 'answers.prompt_id', '=', 'prompts.id')
      .join('users', 'answers.user_id', '=', 'users.id')
      .select(['answers.id as answer_id', 'answers.uuid as answer_uuid', 'answers.created_at as answer_created_at', 'answers.updated_at as answer_updated_at', 'answers.body as answer_body', 'prompts.id as prompt_id', 'prompts.uuid as prompt_uuid', 'prompts.title as prompt_title', 'prompts.created_at as prompt_created_at', 'prompts.updated_at as prompt_updated_at', 'users.id as user_id', 'users.uuid as user_uuid', 'users.display_name as user_display_name', 'users.avatar_url as user_avatar_url'])
      .where('answers.user_id', '!=', currentUserId)
      .where('answers.body', '!=', 'NULL')
      .orderByRaw('random()')
      .limit(limit)
      .offset(offset)
      .then((rows) => {
        if (rows.length > 0) {
          const data = []
          rows.forEach(row => {
            data.push({ id: parseInt(row.answer_id), uuid: row.answer_uuid, created_at: row.answer_created_at, updated_at: row.answer_updated_at, body: row.answer_body, prompt: { id: parseInt(row.prompt_id), uuid: row.prompt_uuid, title: row.prompt_title, created_at: row.prompt_created_at, updated_at: row.prompt_updated_at }, user: { id: parseInt(row.user_id), uuid: row.user_uuid, display_name: row.user_display_name, avatar_url: row.user_avatar_url } })
          })
          return res.status(200).send(data)
        } else {
          return res.status(404).send()
        }
      })
      .catch((err) => {
        return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
      })
  })
}

module.exports = routes
