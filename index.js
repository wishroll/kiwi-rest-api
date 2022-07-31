require('newrelic')
const fastify = require('fastify')({
  logger: true,
  maxParamLength: 1000
})
fastify.register(require('@fastify/swagger'), require('./services/plugins/swagger'))
fastify.ready(err => {
  if (err) throw err
  fastify.swagger()
})
fastify.register(require('./routes/index'))
fastify.listen({
  port: process.env.PORT,
  host: '::'
  // exclusive: false,
  // readableAll: false,
  // writableAll: false,
  // ipv6Only: false
}, (err, add) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${add}`)
})
