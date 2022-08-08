module.exports = async (fastify, options) => {
  const { receivedMessagesIndex, sentMessagesIndex } = require('./schema/v1/index')
  const { show } = require('./schema/v1/show')
  const create = require('./schema/v1/create')
  const jsf = require('json-schema-faker')
  const { sendNotificationOnReceivedSong } = require('../../services/notifications/notifications')

  fastify.get('/v1/me/messages', { onRequest: [fastify.authenticate], schema: receivedMessagesIndex }, async (req, res) => {
    const currentUserId = req.user.id;
    console.log(currentUserId)
    const limit = req.query.limit;
    const offset = req.query.offset;
    try {
      const messages = await fastify.knex('messages')
        .where('messages.recipient_id', currentUserId)
        .offset(offset)
        .limit(limit)
        .orderBy('messages.created_at', 'desc')
      if (messages.length > 0) {
        const trackIds = messages.map(m => m.track_id)
        const messageIds = messages.map(m => m.id)
        const userIds = messages.map(m => m.sender_id)
        const tracks = await fastify.knex('tracks').select().whereIn('track_id', trackIds)
        const ratings = await fastify.knex('ratings').select().whereIn('message_id', messageIds)
        const users = await fastify.knex('users').select().whereIn('id', userIds)
        const data = messages.map((message) => {
          message.track = tracks.find((v) => v.track_id === message.track_id)
          message.rating = ratings.find((v) => v.message_id === message.id)
          message.is_rated = message.rating == true
          console.log('Is the message rated?', message.is_rated)
          message.sender = users.find((v) => v.id === message.sender_id)
          return message
        })
        res.status(200).send(data)
      } else {
        res.status(404).send({ error: true, message: 'Not found' })
      }
    } catch (error) {
      res.status(500).send({ error: true, message: error })
    }
  })

  fastify.get('/v1/users/:id/messages/sent', { onRequest: [fastify.authenticate], schema: sentMessagesIndex }, async (req, res) => {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const userId = req.params.id;
    try {
      const messages = await fastify.knex('messages')
        .where('messages.sender_id', userId)
        .offset(offset)
        .limit(limit)
        .orderBy('messages.created_at', 'desc')
      if (messages.length > 0) {
        const trackIds = messages.map(m => m.track_id)
        const messageIds = messages.map(m => m.id)
        const userIds = messages.map(m => m.sender_id)
        const tracks = await fastify.knex('tracks').select().whereIn('track_id', trackIds)
        const users = await fastify.knex('users').select().whereIn('id', userIds)
        const ratings = await fastify.knex('ratings').select().whereIn('message_id', messageIds)
        const data = messages.map((message) => {
          message.track = tracks.find((v) => v.track_id === message.track_id)
          message.rating = ratings.find((v) => v.message_id === message.id)
          message.sender = users.find((v) => v.id === message.sender_id)
          return message
        })
        res.status(200).send(data)
      } else {
        res.status(404).send({ error: true, message: 'Not found' })
      }
    } catch (error) {
      res.status(500).send({ error: true, message: error })
    }

  })

  fastify.get('/v1/messages/:id', { onRequest: [fastify.authenticate], schema: show }, async (req, res) => {
    const currentUserId = req.user.id
    const message = jsf.generate(show.response[200])
    res.status(200).send(message)
  })

  fastify.post('/v1/messages', { onRequest: [fastify.authenticate], schema: create }, async (req, res) => {
    const currentUserId = req.user.id;
    const recipientIds = req.body.recipient_ids;
    const track = req.body.track;
    const text = req.body.text;
    try {
      const recipients = await fastify.knex('users').select('id').whereIn('id', recipientIds)
      if (recipients.length < 1) {
        return res.status(400).send({ error: true, message: `Recipients could not be found for the given ids: ${recipientIds.toString()}` })
      }
      let trackId;
      const existingTrack = await fastify.knex('tracks').select().where({ track_id: track.track_id, platform: track.platform }).first()
      if (existingTrack) {
        insertIntoSpotifyTracks(existingTrack)
        trackId = existingTrack.track_id;
      } else {
        const results = await fastify.knex('tracks').insert(track, ['*'])
        if (!results || results.length < 1) {
          return res.status(500).send({ error: true, message: 'Could not create a new track' })
        } else {
          trackId = results[0].track_id;
          insertIntoSpotifyTracks(results[0])
        }
      }
      const insertData = await Promise.all(recipients.map(async (recipient) => {
        const id = recipient.id
        sendNotificationOnReceivedSong(currentUserId, id).catch()
        return { sender_id: currentUserId, recipient_id: id, track_id: trackId, text: text }
      }))
      const messages = await fastify.knex('messages').insert(insertData, ['*'])
      if (messages.length > 0) {
        res.status(201).send()
      } else {
        res.status(400).send({ error: true, message: 'Failed to create messages' })
      }
    } catch (error) {
      res.status(500).send({ error: true, message: error })
    }
  })

  function insertIntoSpotifyTracks(existingTrack) {
    fastify.knex('spotify_tracks').select('id').where({ id: existingTrack.track_id }).first().then((alreadyTrack) => {
      if (!alreadyTrack) {
        console.log("In here!")
        const newTrack = {};
        newTrack.id = existingTrack.track_id;
        newTrack.name = existingTrack.name;
        newTrack.href = existingTrack.href;
        newTrack.external_urls = { spotify: existingTrack.external_url };
        newTrack.track_number = existingTrack.track_number;
        newTrack.preview_url = existingTrack.preview_url;
        newTrack.uri = existingTrack.uri;
        newTrack.explicit = existingTrack.explicit;
        newTrack.duration_ms = existingTrack.duration;
        newTrack.external_ids = { isrc: existingTrack.isrc };
        newTrack.album = { artists: existingTrack.artists, images: [existingTrack.artwork] }
        newTrack.artists = existingTrack.artists;
        fastify.knex('spotify_tracks').insert(newTrack, ['id']).then((insertResults) => {
          if (insertResults) {
            console.log("UPdated tracks table with value", insertResults)
          }
        })
      }
    })
  }
}
