module.exports = {
    description: 'Return an array of users',
    tags: ['Search'],
    summary: "Returns a list of users",
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
            query: { type: 'string', description: 'The query to search against' }
        },
        required: ['limit', 'offset', 'query']
    },
    response: {
        200: {
            description: 'The request was successful.',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'integer', minimum: 1 },
                    uuid: { type: 'string' },
                    display_name: { type: 'string' },
                    username: { type: 'string' },
                    created_at: { type: 'string' },
                    updated_at: { type: 'string' },
                    avatar_url: { type: 'string' },
                    friendship_status: { type: 'string', enum: ['none', 'friends', 'pending_sent', 'pending_received'] }

                },
                required: ['id', 'uuid', 'username', 'display_name']
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