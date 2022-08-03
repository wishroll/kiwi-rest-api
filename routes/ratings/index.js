module.exports = async (fastify, options) => {


    fastify.post('/v1/ratings', { onRequest: fastify.authenticate }, async (req, res) => {
        
    })

    fastify.get('/v1/', { onRequest: fastify.authenticate }, async (req, res) => {
        // Send Song Message ID
    })

    

}