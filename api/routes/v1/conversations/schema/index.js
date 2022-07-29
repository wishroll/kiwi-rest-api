const index = {
    description: 'Return an array of conversations',
    tags: ['Conversations'],
    summary: "Returns a list of all a user's conversations",
    headers: {
        type: 'object',
        properties: {
            'Authorization: Bearer': {
                type: 'string'
            }
        },
        required: ['Authorization: Bearer']
    },
    querystring: {
        type: 'object',
        properties: {
            limit: { type: 'integer', description: 'The max number of records to return' },
            offset: { type: 'integer', description: "The number of records to skip before retrieval" }
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
                    id: { type: 'integer' },
                    uuid: { type: 'string' },
                    created_at: { type: 'string' },
                    updated_at: { type: 'string' },
                    
                }
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


module.exports = { index }