module.exports = {
    description: 'Return the properties of a conversation',
    tags: ["Conversations"],
    summary: "Returns the properties of a conversation",
    headers: {
        type: 'object',
        properties: {
            'Authorization': { type: 'string', description: 'The token used for authentication' }
        },
        required: ['Authorization']
    },
    params: {
        type: 'object',
        properties: {
            id: { type: 'integer', description: 'The id of the conversation' },
        },
        required: ['id']
    },
    response: {
        200: {
            description: 'The request was successful.',
            type: 'object',
            properties: {
                id: { type: 'integer', minimum: 1 },
                uuid: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
            },
            required: ['id', 'uuid', 'created_at', 'updated_at']
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
