const routes = async (fastify, options) => {
  const crypto = require('crypto')
  const fetch = require('node-fetch')
  const spotifyAuthUri = process.env.SPOTIFY_AUTH_URI
  
  fastify.post('/spotify/authorize',(req, res) => {
    const state = crypto.randomBytes(16).toString('hex')
    const scope = process.env.SPOTIFY_SCOPE
    const queryParams = {
      response_type: 'code',
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      state: state,
      scope: scope,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      show_dialog: true
    }
    res.redirect(spotifyAuthUri + new URLSearchParams(queryParams))
  })

/**
 * Spotify redirects to the callback endpoint with a code and state query params. The code param can be used to exchange for an access and refresh token.
 */
  fastify.get('/spotify/authorize/callback', async (req, res) => {
    const state = req.query.state || null

    if( state === null) {
      return res.status(401).send()
    } else {
      return res.status(200).send()
    }
  })
  
  fastify.get('/spotify/authorize/tokens', {onRequest: [fastify.authenticate]}, async (req, res) => {
    const code = req.query.code || null
    if(code === null) {
      return res.status(400).send({error: true, message: 'Missing code'})
    }

    const url = process.env.SPOTIFY_API_TOKEN_URI
    const contentType = 'application/x-www-form-urlencoded'
    const authorization = `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')}`
    const grantType = 'authorization_code'

    const authOptions = new URLSearchParams({
      code: code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      grant_type: grantType
    })
    
    try {
      const response = await fetch(url, {
        method: 'Post',
        headers: {
          Authorization: authorization,
          'Content-Type': contentType
        },
        body: authOptions
      })

      if (!response.ok) {
        return res.status(response.status).send(response.statusText)
      }
      
      const data = await response.json()
      const accessToken = data.access_token
      const tokenType = data.token_type
      const scope = data.scope
      const expiresIn = data.expires_in
      const refreshToken = data.refresh_token
      res.status(200).send({accessToken: accessToken, refreshToken: refreshToken, expires_in: expiresIn })
    } catch (error) {
      res.status(500).send(error)
    }
    
    
  })

  fastify.post('/spotify/authorize/refresh', async (req, res) => {
    const refreshToken = req.body.refresh_token
    try {
        const authOptions = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
        const url = process.env.SPOTIFY_API_TOKEN_URI
        const authorization = `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')}`
        const response = await fetch(url, {
            method: 'Post',
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: authOptions
        })
        const data = await response.json()
        const accessToken = data.access_token
        const expiresIn = data.expires_in
        const scope = data.scope
        const tokenType = data.token_type
        res.status(201).send({access_token: accessToken, expires_in: expiresIn})
    } catch (error) {
        res.status(500).send(error)
    }
  })
}

module.exports = routes
