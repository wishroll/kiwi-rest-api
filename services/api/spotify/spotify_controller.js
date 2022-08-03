module.exports = async (fastify, options) => {
  const fetch = require('node-fetch')
  const { sendNotificationOnReceivedSong } = require('../../notifications/notifications')

  fastify.get('/spotify/tracks/recieved', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const currentUserId = req.user.id
    const offset = req.query.offset
    const limit = req.query.limit
    try {
      const tracks = await fastify.knex('spotify_tracks').join('messages', 'spotify_tracks.id', '=', 'messages.track_id').join('users', 'messages.sender_id', '=', 'users.id').where('messages.recipient_id', '=', currentUserId).orderBy('messages.created_at', 'desc').offset(offset).limit(limit)
      if (tracks.length > 0) {
        res.status(200).send(tracks)
      } else {
        res.status(404).send()
      }
    } catch (error) {
      console.log(error)
      res.status(500).send({ error: true, message: error })
    }
  })

  fastify.post('/spotify/friends/tracks', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const currentUserId = req.user.id
    const tracks = req.body.tracks
    if (!tracks) {
      return res.status(400).send({ error: true, message: 'Missing tracks' })
    }

    try {
      const createdFriendsRows = await fastify.knex('friends').select('friends.friend_id').where({ user_id: currentUserId })
      const createdFriends = createdFriendsRows.map((row) => row.friend_id)
      const acceptedFriendsRows = await fastify.knex('friends').select('friends.user_id').where({ friend_id: currentUserId })
      const acceptedFriends = acceptedFriendsRows.map((row) => row.user_id)
      const friends = createdFriends.concat(acceptedFriends)
      if (friends.length > 0) {
        const users = await fastify.knex('users').select('id').whereIn('id', friends)
        if (users.length > 0) {
          const records = await Promise.all(
            tracks.map(async (track) => {
              const existingTrack = await fastify.knex('spotify_tracks').select('id').where({ id: track.id }).first()
              if (existingTrack) {
                const records = await Promise.all(
                  users.map(async (user_id) => {
                    const record = await fastify.knex('messages').insert({ sender_id: currentUserId, recipient_id: user_id.id, track_id: existingTrack.id })
                    return record
                  })
                )
                return records
              } else {
                const createdRecords = await fastify.knex('spotify_tracks').insert(track, ['id'])
                if (createdRecords && createdRecords.length > 0) {
                  console.log(createdRecords)
                  const track = createdRecords[0]
                  const records = await Promise.all(
                    users.map(async (user_id) => {
                      const record = await fastify.knex('messages').insert({ sender_id: currentUserId, recipient_id: user_id.id, track_id: track.id })
                      return record
                    })
                  )
                  return records
                } else {
                  res.status(500).send({ error: true, message: "Track couldn't be created" })
                }
              }
            })
          )
          if (records.length > 0) {
            res.status(201).send()
          } else {
            res.status(500).send({ error: true, message: 'Error creating records' })
          }
        } else {
          res.status(404).send({ error: true, message: 'No users found' })
        }
      } else {
        res.status(404).send({ error: true, message: 'No friends' })
      }
    } catch (error) {
      res.status(500).send({ error: true, message: error })
    }
  })

  /**
   * V2
   */

  fastify.post('/v2/spotify/friends/tracks', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const currentUserId = req.user.id
    const track = req.body.track
    const recipients = req.body.recipients
    if (!track) {
      return res.status(400).send({ error: true, message: 'Missing tracks' })
    }
    if (!recipients) {
      return res.status(400).send({ error: true, message: 'No recipients' })
    }
    try {
      const recipientIds = recipients.map((recipient) => recipient.id)
      const users = await fastify.knex('users').select('id').whereIn('id', recipientIds)
      if (users.length <= 0) {
        res.status(404).send({ error: true, message: 'No users found' })
      }
      const existingTrack = await fastify.knex('spotify_tracks').where({ id: track.id }).first()
      if (existingTrack) {
        insertIntoTracksTable(existingTrack)
        const records = await Promise.all(
          users.map(async (user_id) => {
            const record = await fastify.knex('messages').insert({ sender_id: currentUserId, recipient_id: user_id.id, track_id: existingTrack.id })
            sendNotificationOnReceivedSong(currentUserId, user_id.id).catch()
            return record
          })
        )
        if (records.length > 0) {
          res.status(201).send()
        } else {
          res.status(500).send({ error: true, message: 'Error creating records' })
        }
      } else {
        const createdRecords = await fastify.knex('spotify_tracks').insert(track, ['id'])
        if (createdRecords && createdRecords.length > 0) {
          console.log(createdRecords)
          const track = createdRecords[0]
          insertIntoTracksTable(track)
          const records = await Promise.all(
            users.map(async (user_id) => {
              const record = await fastify.knex('messages').insert({ sender_id: currentUserId, recipient_id: user_id.id, track_id: track.id })
              sendNotificationOnReceivedSong(currentUserId, user_id.id).catch()
              return record
            })
          )
          if (records.length > 0) {
            res.status(201).send()
          } else {
            res.status(500).send({ error: true, message: 'Error creating records' })
          }
        } else {
          res.status(500).send({ error: true, message: "Track couldn't be created" })
        }
      }
    } catch (error) {
      res.status(500).send({ error: true, message: error })
    }
  })

  function insertIntoTracksTable(existingTrack) {
    fastify.knex('tracks').select(['track_id', 'platform', 'id']).where({ track_id: existingTrack.id, platform: 'spotify' }).first().then((alreadyTrack) => {
      if (!alreadyTrack) {
        console.log("In here!")
        const newTrack = {};
        newTrack.platform = 'spotify';
        newTrack.track_id = existingTrack.id;
        newTrack.name = existingTrack.name;
        newTrack.href = existingTrack.href;
        newTrack.external_url = existingTrack.external_urls.spotify;
        newTrack.track_number = existingTrack.track_number;
        newTrack.preview_url = existingTrack.preview_url;
        newTrack.uri = existingTrack.uri;
        newTrack.explicit = existingTrack.explicit;
        newTrack.duration = existingTrack.duration_ms;
        newTrack.isrc = existingTrack.external_ids.isrc;
        newTrack.release_date = existingTrack.album.release_date;
        newTrack.artists = existingTrack.artists.map((artist) => {
          const a = {};
          a.name = artist.name;
          a.uri = artist.uri;
          a.id = artist.id;
          return a;
        });
        const images = existingTrack.album.images;
        newTrack.artwork = images.length > 0 ? images[0] : null;
        fastify.knex('tracks').insert(newTrack, ['id']).then((insertResults) => {
          if (insertResults) {
            console.log("UPdated tracks table with value", insertResults)
          }
        })
      }
    })
  }

}
