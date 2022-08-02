module.exports = {
    description: 'Create a new Rating',
    tags: ['Ratings'],
    summary: 'Create a new rating',
    headers: {
        type: 'object',
        properties: {
            Authorization: { type: 'string', description: 'The token used for authentication' }
        },
        required: ['Authorization']
    },
    body: {
        
    }
}