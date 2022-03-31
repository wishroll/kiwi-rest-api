const routes = async (fastify, options) => {
    const crypto = require('crypto')
    const fetch = require("node-fetch");
    const spotifyAuthUri = process.env.SPOTIFY_AUTH_URI
    const state = crypto.randomBytes(16).toString('hex')

    fastify.post('/spotify/authorize', (req, res) => {

        const scope = process.env.SPOTIFY_SCOPE
        const queryParams = {
            response_type: 'code',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            state: state,
            scope: scope,
            client_id: process.env.SPOTIFY_CLIENT_ID, 
        }

        res.redirect(spotifyAuthUri + new URLSearchParams(queryParams))

    })


    fastify.get('/spotify/authorize/callback', async (req, res) => {
        const authCode = req.query.code || null
        const requestState = req.query.state || null

        if(state != requestState) {
            return res.status(401).send()
        }

        const url = process.env.SPOTIFY_API_TOKEN_URI
        const contentType = 'application/x-www-form-urlencoded'
        const authorization = `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')}`
        const grantType = "authorization_code"

        
        const authOptions = new URLSearchParams({
            code: authCode,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            grant_type: grantType,
        })

        try {
            const response = await fetch(url, {
                                                method: "Post",
                                                headers: {
                                                    'Authorization':  authorization,
                                                    'Content-Type': contentType
                                                },
                                                body: authOptions
                                            })
            if(!response.ok) {
               return res.status(response.status).send(response.statusText) 
            }
            const data = await response.json()
            const accessToken = data.access_token
            const tokenType = data.token_type
            const scope = data.scope
            const expiresIn = data.expires_in
            const refreshToken = data.refresh_token

            await fastify.redisClient.set('SPOTIFY_REFRESH_TOKEN', refreshToken)
            await fastify.redisClient.set('SPOTIFY_ACCESS_TOKEN', accessToken)
            console.log(`This is the spotify access token: ${accessToken}.\n\nThis is the spotify refresh token: ${refreshToken}`)
            res.status(200).send({message: "Success!"})
            
        } catch (error) {
            res.status(500).send(error)
        }


    })

    fastify.get('/spotify/authorize/refresh_token', (req, res) => {

    })
}

module.exports = routes