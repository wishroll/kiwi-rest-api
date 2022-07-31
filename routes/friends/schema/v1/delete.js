const deleteFriendship = {
    description: 'Delete a friendship',
    tags: ['Relationships'],
    summary: 'Delete a friendship',
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
            user_id: { type: 'integer', description: 'The user id of the friend' },
        },
        required: ['user_id']
    },
    response: {
        200: {
            description: 'The request was successful.',
            type: 'boolean'

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

const deleteFriendshipRequest = {
    description: 'Delete a friendship request',
    tags: ['Relationships'],
    summary: 'Delete a friendship request',
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
            user_id: { type: 'integer', description: 'The id of the user being requested' },
        },
        required: ['user_id']
    },
    response: {
        200: {
            description: 'The request was successful.',
            type: 'boolean'

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
module.exports = {deleteFriendship, deleteFriendshipRequest}