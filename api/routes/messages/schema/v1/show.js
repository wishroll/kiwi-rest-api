const show = {
    description: 'Return a message',
    tags: ['Messages'],
    summary: 'Return the properties of a message',
    params: {
        type: 'object',
        properties: {
            id: { type: 'integer', description: 'The id of the message' }
        },
        required: ['id']
    },
    headers: {
        type: 'object',
        properties: {
            'Authorization': { type: 'string', description: 'The token used for authentication' }
        },
        required: ['Authorization']
    },
    response: {
        200: {
            description: 'The request was successful',
            type: 'object',
            properties: {
                id: { type: 'integer', minimum: 1},
                uuid: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: {type: 'string'}
            },
            required: ['id', 'uuid', 'created_at', 'updated_at']
        },
        404: {
            description: 'Not found',
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        500: {
            description: 'Internal Server Error',
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
}
module.exports = {show}