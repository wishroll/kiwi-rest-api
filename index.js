const fastify = require('fastify')({
    logger: true
  })
const PORT = process.env.PORT || 3000; 
const knexConfig = require('./db/knexfile');
//initialize knex
const knex = require('knex')(knexConfig["development"]);
/*
    The root route returns the curre
*/
fastify.get('/', (req, res) => {
    return res.send({ status: 'Hello world' });
});

fastify.get('/home', (req, res) => {

});

fastify.get('/users/:id', (req, res) => {
    knex('users')
    .select('*')
    .then((users) => {
        return res.status(200).send(users);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: "An error occured"});
    })
});

fastify.get('/chat_rooms', (req, res) => {

});
fastify.get('/chat_rooms/:id', (req, res) => {

});
fastify.get('/chat_rooms/:id/messages', (req, res) => {

});
fastify.post('/signup', (req, res) => {

});
fastify.post('/login', (req, res) => {

});
fastify.post('/signup/verifiy-phone-number', (req, res) => {

});

fastify.listen(PORT, '0.0.0.0', (err, add) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${add}`)
});