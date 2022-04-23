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
}

module.exports = routes
