const routes = async (fastify, options) => {


    const fetch = require('node-fetch')
    fastify.get('/spotify/me/playlists', {onRequest: [fastify.authenticate]}, async (req, res) => {
        const currentUserId = req.user.id
        const accessCode = req.headers['spotify-authorization']
        console.log(accessCode)
        if(!accessCode) {
            return res.status(401).send({error: true, message: 'Missing Spotify Auth token'})
        }

        const url = 'https://api.spotify.com/v1/me/playlists'
        const header = {'Content-Type' : 'application/json', 'Authorization' : `Bearer ${accessCode}`}
        try {
            const response = await fetch(url, {
                method: 'Get',
                headers: header
            })
            if(response.ok) {
                const data = await response.json()
                res.status(200).send(data)
            } else {
                console.log(response.status, response.statusText)
                res.status(response.status).send({error: true, message: response.statusText})
            }
        } catch (error) {
            res.status(500).send({error: true, message: error})
        }
    })

    fastify.get('/spotify/tracks/recieved', {onRequest: [fastify.authenticate]}, async (req, res) => {
        const currentUserId = req.user.id
        const offset = req.query.offset
        const limit = req.query.limit
        try {
            const tracks = await fastify.knex('spotify_tracks').join('sent_spotify_tracks', 'spotify_tracks.id', '=', 'sent_spotify_tracks.spotify_track_id').join('users', 'sent_spotify_tracks.recipient_id', '=', 'users.id').where('sent_spotify_tracks.recipient_id', '=', currentUserId).offset(offset).limit(limit)
            if(tracks.length > 0) {
                res.status(200).send(tracks)
            } else {
                res.status(404).send()
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({error: true, message: error})
        }
    })

    fastify.post('/spotify/friends/tracks', {onRequest: [fastify.authenticate]}, async (req, res) => {
        const currentUserId = req.user.id
        const tracks = req.body.tracks
        if(!tracks) {
            return res.status(400).send({error: true, message: 'Missing tracks'})
        }

        try {
            const createdFriendsRows = await fastify.knex('friends').select('friends.friend_id').where({user_id: currentUserId})
            const createdFriends = createdFriendsRows.map((row) => row["friend_id"])
            const acceptedFriendsRows = await fastify.knex('friends').select('friends.user_id').where({friend_id: currentUserId})
            const acceptedFriends = acceptedFriendsRows.map((row) => row["user_id"])
            const friends = createdFriends.concat(acceptedFriends)
            if(friends.length > 0) {
                const users = await fastify.knex('users').select('id').whereIn('id', friends)
                if(users.length > 0) {
                    const records = await Promise.all(
                        tracks.map(async (track) => {
                            const existingTrack = await fastify.knex('spotify_tracks').select('id').where({id: track.id}).first()
                            if(existingTrack){
                                const records = await Promise.all(
                                    users.map(async (user_id) => {
                                        const record = await fastify.knex('sent_spotify_tracks').insert({sender_id: currentUserId, recipient_id: user_id['id'], spotify_track_id: existingTrack.id})
                                        return record
                                    })
                                )
                                return records
                            } else {
                                const createdRecords = await fastify.knex('spotify_tracks').insert(track, ['id'])
                                if(createdRecords && createdRecords.length > 0) {
                                    console.log(createdRecords)
                                    const track = createdRecords[0]
                                    const records = await Promise.all(
                                        users.map(async (user_id) => {
                                            const record = await fastify.knex('sent_spotify_tracks').insert({sender_id: currentUserId, recipient_id: user_id['id'], spotify_track_id: track['id']})
                                            return record
                                        })
                                    )
                                    return records
                                } else {
                                    res.status(500).send({error: true, message: "Track couldn't be created"})
                                }
                            }
                        })
                    )
                    if(records.length > 0) {
                        res.status(201).send()
                    } else {
                        res.status(500).send({error: true, message: "Error creating records"})
                    }
                } else {
                    res.status(404).send({error: true, message: 'No users found'})
                }
            } else {
                res.status(404).send({error: true, message: 'No friends'})
            }
        } catch (error) {
            res.status(500).send({error: true, message: error})
        }
    })
}

module.exports = routes
