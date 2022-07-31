const friends = {
    description: "Return an array of a user's friends",
    tags: ['Relationships'],
    summary: "Returns a list of a user's friends",
    headers: {
        type: 'object',
        properties: {
            'Authorization': {
                type: 'string'
            }
        },
        required: ['Authorization']
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
                    avatar_url: { type: 'string' },
                    friendship_status: { type: 'string', enum: ['none', 'friends', 'pending_sent', 'pending_received'] }
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

const requests = {
    description: "Return an array of a user's pending received friend requests",
    tags: ['Relationships'],
    summary: "Returns a list of a user's received friend requests",
    headers: {
        type: 'object',
        properties: {
            'Authorization': {
                type: 'string'
            }
        },
        required: ['Authorization']
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
                    avatar_url: { type: 'string' },
                    friendship_status: { type: 'string', enum: ['none', 'friends', 'pending_sent', 'pending_received'] }
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

const requested = {
    description: "Return an array of a user's pending sent friend requests",
    tags: ['Relationships'],
    summary: "Returns a list of a user's sent friend requests",
    headers: {
        type: 'object',
        properties: {
            'Authorization': {
                type: 'string'
            }
        },
        required: ['Authorization']
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
                    avatar_url: { type: 'string' },
                    username: { type: 'string' },
                    friendship_status: { type: 'string', enum: ['none', 'friends', 'pending_sent', 'pending_received'] }
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

const contacts = {
    description: "Return a list of user's based on an array of phone numbers",
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
                    friendship_status: { type: 'string', enum: ['none', 'friends', 'pending_sent', 'pending_received'] }
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

module.exports = { friends, requests, requested, contacts }