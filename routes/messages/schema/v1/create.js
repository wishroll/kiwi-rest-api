module.exports = {
    description: 'Create a new message',
    tags: ['Messages'],
    summary: 'Create a new message',
    headers: {
        type: 'object',
        properties: {
            Authorization: { type: 'string', description: 'The token used for authentication' }
        },
        required: ['Authorization']
    },
    body: {
        type: 'object',
        properties: {
            track: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    platform: { type: 'string', enum: ['spotify', 'apple_music'] },
                    uri: { type: 'string' },
                    external_url: { type: 'string' },
                    href: { type: 'string' },
                    name: { type: 'string' },
                    duration: { type: 'integer' },
                    track_number: { type: 'integer' },
                    release_date: { type: 'string' },
                    isrc: { type: 'string' },
                    artists: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                uri: { type: 'string' },
                                href: { type: 'string' }
                            }
                        },
                        required: ['id', 'name', 'href']
                    },
                    explicit: { type: ['boolean'] },
                    artwork: {
                        type: 'object',
                        properties: {
                            width: { type: 'integer' },
                            height: { type: 'integer' },
                            url: { type: 'string' }
                        },
                        required: ['url']
                    }
                },
                required: ['id', 'name', 'artists', 'artwork', 'href', 'external_url', 'duration', 'track_number', 'isrc', 'platform']
            },
            recipient_ids: {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'integer'
                }
            },
            text: { type: 'string' }
        },
        required: ['track', 'recipient_ids']
    },
    response: {
        201: {
            description: 'The request was successful.',
            type: 'null'
        },
        400: {
            description: 'Client error',
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        409: {
            description: 'Client Error',
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