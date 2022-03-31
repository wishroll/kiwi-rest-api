const fastify = require('fastify')({
  logger: true,
  maxParamLength: 1000
})
fastify.register(require('./api/routes/v1/api_routes_v1'))
fastify.listen(process.env.PORT, '0.0.0.0', (err, add) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${add}`)
})
