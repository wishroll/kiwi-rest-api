const create = {
    description: 'Create a new conversation',
    tags: ["Conversations"],
    summary: "Create a new conversation",
    headers: {
        type: 'object',
        properties: {
            'Authorization': { type: 'string', description: 'The token used for authentication' }
        },
        required: ['Authorization']
    },
    body: {
        type: 'object',
        required: [],
        properties: {
            id: { type: 'integer', description: 'The id of the conversation' },
        },
        required: ['id']
    },
    response: {
        201: {
            description: 'The request was successful.',
            type: 'object',
            properties: {
                id: { type: 'integer', minimum: 1},
                uuid: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
            },
            required: ['id', 'uuid', 'created_at', 'updated_at']
        },
        400: {
            description: 'Client error',
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
module.exports = {create}