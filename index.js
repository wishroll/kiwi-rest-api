const fastify = require('fastify')({
  logger: true,
  maxParamLength: 1000
})
fastify.register(require('@fastify/swagger'), require('./services/plugins/swagger'))
fastify.ready(err => {
  if (err) throw err
  fastify.swagger()
})
fastify.register(require('./api/routes/index'))
fastify.listen(process.env.PORT, '0.0.0.0', (err, add) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${add}`)
})
