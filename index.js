const fastify = require('fastify')({
    logger: true
  })
const { port, environment } = require('./config');
const PORT = port || 3000; 
const knexConfig = require('./db/knexfile');
//initialize knex
const knex = require('knex')(knexConfig[environment]);
const {phone} = require('phone');
const twilioClient = require('./web_services/twilio_client');

fastify.get('/', (req, res) => {
    return res.send({ status: 'Hello world' });
});

fastify.get('/home', (req, res) => {

});

/**
 * 
 */
fastify.post('/signup/validate', (req, res) => {
    let phoneNumber = req.body["phone_number"];
    const countryCode = req.body["country_code"];
    phoneNumber = phone(phoneNumber, {country: countryCode})['phoneNumber'];
    // console.log(`This is the phone number given in the request body ${phoneNumber}`);
    if (phoneNumber !== null) {
        knex('users')
        .select('phone_number')
        .where({phone_number: phoneNumber})
        .limit(1)
        .then((rows) => {
            if (rows.length > 0) {
                return res.status(409).send();
            } else {
                return res.status(200).send();
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).send({success: false, message: `An error occured: ${error.message}`});
        })
    } else {
        return res.status(400).send();
    }
});

fastify.post('/signup/send-token', (req, res) => {
    let phoneNumber = req.body['phone_number'];
    const countryCode = req.body['country_code'];
    phoneNumber = phone(phoneNumber, {country: countryCode})["phoneNumber"];
    if (phoneNumber !== null) {
        twilioClient.sendToken(phoneNumber, (verification, error) => {
            if (error !== null) {
                //handle error
                console.log(error);
                return res.status(error["status"]).send({success: false, message: `An error occured: ${error.message}`});
            } else if (verification !== null) {
                console.log("Verification token recieved", verification);
                return res.status(201).send({success: true, message: `Verification token created and sent: ${verification["status"]}`});
            }
        });
    } else {
        return res.status(400).send();  
    }
});

fastify.post('/signup/verify', (req, res) => {
    let phoneNumber = req.body['phone_number'];
    const token = req.body['token'];
    const countryCode = req.body['country_code'];
    phoneNumber = phone(phoneNumber, {country: countryCode})["phoneNumber"];
    if ((phoneNumber !== null && phoneNumber !== undefined) && token !== undefined) {
        twilioClient.verify(phoneNumber, token, (verificationChecks, error) => {
            if (error !== null) {
                //handle error
                console.log(error);
                return res.status(error["status"]).send({success: false, message: `An error occured: ${error.message}`}); 
            } else if (verificationChecks !== null) {
                console.log("Verification Token verified!");
                return res.status(200).send({success: true, message: `Verification Token verified: ${verificationChecks.status}`});
            }
        });
    } else {
        return res.status(400).send();
    }
});

fastify.post('/signup', (req, res) => {
    let phoneNumber
});

fastify.get('/users', (req, res) => {
    const limit = req.query['limit'];
    const offset = req.query['offset'];
    console.log(limit, offset);
    knex('users')
    .select('*')
    .limit(limit)
    .offset(offset)
    .orderBy('id', 'asc')
    .then((rows) => {
        if (rows.length > 0) {
            return res.status(200).send(rows);
        } else {
            return res.status(404).send();
        }
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: `An error occured: ${err.message}`});
    })
});

fastify.get('/users/:id', (req, res) => {
    knex('users')
    .select('id', 'uuid', 'display_name', 'phone_number', 'created_at', 'updated_at')
    .where({id: req.params["id"]})
    .then((rows) => {
        if (rows.length > 0) {
            const user = rows[0];
            return res.status(200).send(user);
        } else {
            return res.status(404).send();
        }
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: `An error occured: ${err.message}`});
    })
});

fastify.put('/users/:id', (req, res) => {
    console.log(req.body);
    const updateParams = {};
    updateParams["display_name"] = req.body['display_name']
    knex('users')
    .select('id')
    .where({id: req.params["id"]})
    .update(updateParams, ['id', 'uuid', 'display_name', 'phone_number', 'created_at', 'updated_at'])
    .then((user) => {
        console.log(user);
        return res.status(200).send(user);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: "An error occured"});
    });
});

fastify.get('/chat_rooms', (req, res) => {

});
fastify.get('/chat_rooms/:id', (req, res) => {

});
fastify.get('/chat_rooms/:id/messages', (req, res) => {

});
fastify.post('/login', (req, res) => {

});

fastify.listen(PORT, '0.0.0.0', (err, add) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${add}`)
});