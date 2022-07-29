const contacts = {
    description: "Return a list of kiwi user's based on a user's contacts",
    tags: ['Relationships'],
    summary: "Returns a list of kiwi users based on a user's contacts",
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
            limit: { type: 'integer' },
            offset: { type: 'integer' }
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
                    display_name: { type: 'string' },
                    username: { type: 'string' },
                    relationship_status: { type: 'string', enum: ['none', 'friends', 'pending_sent', 'pending_received'] }
                }
            }
        },
        404: {
            description: 'Not found',
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
}