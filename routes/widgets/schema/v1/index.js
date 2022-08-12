module.exports = {
    description: 'Return an array of received song messages',
    tags: ['Widgets'],
    summary: "Returns a list of received song messages",
    headers: {
        type: 'object',
        properties: {
            Authorization: { type: 'string', description: 'The token used for authentication' }
        },
        required: ['Authorization']
    },
    querystring: {
        type: 'object',
        properties: {
            limit: { type: 'integer', description: 'The max number of records to return' },
            offset: { type: 'integer', description: 'The number of records to skip before retrieval' },
        },
        required: ['limit', 'offset']
    },
    response: {
        200: {
            description: 'The request was successful.',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    track_id: { type: 'string' },
                    platform: { type: 'string', enum: ['spotify', 'apple_music'] },
                    artwork_url: { type: 'string', description: 'The url of the album artwork' },
                    sender_avatar_url: { type: 'string', description: 'The url of the senders avatar' },
                    name: { type: 'string', description: 'The name of the song' },
                    artists: {
                        type: 'array', items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                            }
                        }
                    }
                },
                required: ['track_id', 'platform', 'sender_avatar_url', 'artwork_url']
            }
        },
        404: {
            description: 'Not Found',
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        500: {
            description: 'Internal Server Error',
            summary: 'A response indicating an error occurred on the server.',
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
}