const routes = async (fastify, options) => {
    fastify.get('/chat_rooms', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const limit = req.query.limit || 10
        const offset = req.query.offset
        const userId = req.user.id
        const chatRooms = await fastify.knex('chat_rooms')
          .join('chat_room_users', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
          .join('users', 'chat_room_users.user_id', '=', 'users.id')
          .select(['chat_rooms.id as chat_rooms_id', 'chat_rooms.uuid as chat_rooms_uuid', 'chat_rooms.created_at as chat_rooms_created_at', 'chat_rooms.updated_at as chat_rooms_updated_at', 'users.display_name as users_display_name'])
          .where('users.id', '=', userId)
          .limit(limit)
          .offset(offset)
          .orderBy('chat_rooms.updated_at', 'desc')
        if (chatRooms.length > 0) {
          const data = []
          const chat_room_users = []
          await Promise.all(chatRooms.map(async (row) => {
            const chatRoomId = parseInt(row.chat_rooms_id)
            const message = await fastify.knex('messages').select(['id', 'uuid', 'kind', 'created_at', 'updated_at', 'answer_id', 'body', 'chat_room_user_id']).where({ chat_room_id: chatRoomId }).orderBy('messages.created_at', 'desc').first()
            if (message && message.answer_id) {
              const chatRoomUser = await fastify.knex('chat_room_users').select('user_id').where({ id: message.chat_room_user_id }).first()
              const user = await fastify.knex('users').select(['id', 'uuid', 'display_name', 'avatar_url']).where({ id: chatRoomUser.user_id }).first()
              const answer = await fastify.knex('answers').select().where({ id: parseInt(message.answer_id) }).first()
              const prompt = await fastify.knex('prompts').select().where({ id: parseInt(answer.prompt_id) }).first()
              answer.prompt = prompt
              message.user = user
              message.answer = answer
              console.log(message)
            }
            const chatRoomUsers = await fastify.knex('users').join('chat_room_users', 'chat_room_users.user_id', '=', 'users.id')
              .select(['users.id as id', 'users.uuid as uuid', 'users.display_name as display_name', 'users.avatar_url as avatar_url'])
              .where('chat_room_users.chat_room_id', '=', chatRoomId)
              .where('chat_room_users.user_id', '!=', userId)
              .distinct('users.id')
            data.push({ id: row.chat_rooms_id, uuid: row.chat_rooms_uuid, created_at: row.chat_rooms_created_at, updated_at: row.chat_rooms_updated_at, recent_message: message, chat_room_users: chatRoomUsers })
          }))
          res.status(200).send(data)
        } else {
          res.status(404).send()
        }
      })
      
      fastify.get('/chat_rooms/:id', { onRequest: [fastify.authenticate] }, (req, res) => {
        const userId = req.user.id
        fastify.knex('chat_rooms')
          .join('chat_room_users', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
          .join('users', 'chat_room_users.user_id', '=', 'users.id')
          .select(['chat_rooms.id as chat_rooms_id', 'chat_rooms.uuid as chat_rooms_uuid', 'chat_rooms.created_at as chat_rooms_created_at', 'chat_rooms.updated_at as chat_rooms_updated_at'])
          .where('users.id', '=', userId)
          .then((rows) => {
            if (rows.length > 0) {
              const row = rows[0]
              const data = { id: row.chat_rooms_id, uuid: row.chat_rooms_uuid, created_at: row.chat_rooms_created_at, updated_at: row.chat_rooms_updated_at }
              console.log(data)
              return res.status(200).send(data)
            } else {
              res.status(404).send()
            }
          })
          .catch((err) => {
            console.error(err)
            return res.status(500).send({ success: false, message: 'An error occured' })
          })
      })
      
      fastify.get('/chat_rooms/:id/messages', { onRequest: [fastify.authenticate] }, (req, res) => {
        const userId = req.user.id
        const limit = req.query.limit || 10
        const offset = req.query['']
        const chatRoomId = req.params.id
        fastify.knex('messages')
          .join('chat_rooms', 'messages.chat_room_id', '=', 'chat_rooms.id')
          .join('chat_room_users', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
          .join('users', 'chat_room_users.user_id', '=', 'users.id')
          .where('chat_rooms.id', '=', chatRoomId)
          .where('chat_room_users.user_id', '=', userId)
          .where('chat_room_users.chat_room_id', '=', chatRoomId)
          .select(['messages.body as messages_body', 'messages.id as messages_id', 'messages.uuid as messages_uuid', 'messages.kind as messages_kind', 'messages.created_at as messages_created_at', 'messages.updated_at as messages_updated_at', 'users.id as users_id', 'users.uuid as users_uuid', 'users.display_name as users_display_name'])
          .limit(limit)
          .offset(offset)
          .orderBy('messages.created_at', 'desc')
          .then((rows) => {
            if (rows.length > 0) {
              const data = []
              res.status(200).send()
            } else {
              res.status(404).send()
            }
          })
          .catch((err) => {
            console.error(err)
            return res.status(500).send({ success: false, message: 'An error occured' })
          })
      })
      
      fastify.post('/chat_rooms/:id/messages', (req, res) => {
      
      })
      
      fastify.post('/prompts/:prompt_id/answers/:answer_id/messages', { onRequest: [fastify.authenticate] }, async (req, res) => {
        const currentUserId = req.user.id
        const answerId = req.params.answer_id
        const messagedUserId = req.body.user_id
        const requestMessage = req.body.message
        // Given multiple user_ids, does a chat room exit where chat_room_users with the given user_ids share the same chat_room_id
        const chatRoomUsers = await fastify.knex('chat_room_users').select(['chat_room_users.chat_room_id'])
          .where('chat_room_users.user_id', messagedUserId)
          .intersect((knex) => {
            knex.select(['chat_room_users.chat_room_id'])
              .from('chat_room_users')
              .where('chat_room_users.user_id', currentUserId)
          })
        if (chatRoomUsers.length > 0) {
          const chat_room_id = chatRoomUsers[0].chat_room_id
          const chat_room_user_ids = await fastify.knex('chat_room_users').select('chat_room_users.id').where({ chat_room_id: parseInt(chat_room_id), user_id: currentUserId })
          const chat_room_user_id = chat_room_user_ids[0].id
          const responseMessage = await fastify.knex('messages').insert({ answer_id: answerId, body: requestMessage, chat_room_id: parseInt(chat_room_id), chat_room_user_id: parseInt(chat_room_user_id), kind: 'text' }, ['id', 'uuid', 'created_at', 'updated_at', 'body'])
          return res.status(200).send(responseMessage)
        } else {
          const chat_rooms = await fastify.knex('chat_rooms').insert({}, ['id'])
          const chat_room_id = parseInt(chat_rooms[0].id)
          const chat_room_user_ones = await fastify.knex('chat_room_users').insert({ chat_room_id: chat_room_id, user_id: messagedUserId }, ['id'])
          const messaged_chat_room_user_id = parseInt(chat_room_user_ones[0].id)
          const chat_room_user_twos = await fastify.knex('chat_room_users').insert({ chat_room_id: chat_room_id, user_id: currentUserId }, ['id'])
          const messaging_chat_room_user_id = parseInt(chat_room_user_twos[0].id)
          const message = await fastify.knex('messages').insert({ answer_id: answerId, body: requestMessage, chat_room_id: chat_room_id, chat_room_user_id: messaging_chat_room_user_id, kind: 'text' }, ['id', 'uuid', 'created_at', 'updated_at', 'body'])
          return res.status(200).send(message)
        }
      })
      
      fastify.delete('/chat_rooms/:chat_room_id/messages/:id', (req, res) => {
      
      })
      
      fastify.delete('/chat_rooms/:id', (req, res) => {
      
      })
}

module.exports = routes