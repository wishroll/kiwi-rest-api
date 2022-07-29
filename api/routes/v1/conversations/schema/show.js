const show = {
    description: 'Return the properties of a conversation',
    tags: ["Conversations"],
    summary: "Returns the properties of a conversation",
    headers: {
        type: 'object',
        properties: {
            'Authorization: Bearer': {
                type: 'string'
            }
        },
        required: ['Authorization: Bearer']
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
                id: { type: 'integer' },
                uuid: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
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
module.exports = {show}