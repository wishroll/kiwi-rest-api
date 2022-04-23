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

    fastify.post('/spotify/friends/tracks', {onRequest: [fastify.authenticate]}, async (req, res) => {
        const currentUserId = req.user.id
        const tracks = req.body.tracks
        if(!tracks) {
            return res.status(400).send({error: true, message: 'Missing tracks'})
        }

        try {
            const createdFriends = await fastify.knex('friends').select('friends.friend_id').where({user_id: currentUserId})
            const acceptedFriends = await fastify.knex('friends').select('friends.user_id').where({friend_id: currentUserId})
            const friends = createdFriends.concat(acceptedFriends)
            if(friends.length > 0) {
                const users = await fastify.knex('users').select().whereIn('id', friends)
                if(users.length > 0) {
                    const spotifyTracks = await fastify.knex('spotify_tracks').insert(tracks)
                    res.status(201).send()
                } else {
                    res.status(404).send({error: true, message: 'No users found'})
                }
            } else {
                res.status(404).send({error: true, message: 'No friends'})
            }
        } catch (error) {
            
        }
    })
}

module.exports = routes
