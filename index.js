const { port, environment, masterKey } = require('./config');
const fastify = require('fastify')({
    logger: true
  })
fastify.register(require('fastify-jwt'), {
    secret: masterKey
  })
const PORT = port || 3000; 
const knexConfig = require('./db/knexfile');
//initialize knex
const knex = require('knex')(knexConfig[environment]);
const {phone} = require('phone');
const twilioClient = require('./web_services/twilio_client');
const redisClient = require('./redis_client');




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
    console.log(`This is the phone number given in the request body ${phoneNumber}`);
    if (phoneNumber !== null) {
        const cacheKey = `phone-number-is-available-${phoneNumber}`;
        console.log("This is the cache key", cacheKey);
        redisClient.client.get(cacheKey)
        .then((isAvailable) => {
            if (isAvailable !== undefined && isAvailable !== null) {
                //isAvailable is a boolean type that represents whether no user record exists with the a phone_number value as the phoneNumber param
                if (isAvailable) {
                    return res.status(200).send();
                } else {
                    return res.status(409).send();
                }
            } else {
                // Fetch user that matches given phone number from db
                knex('users')
                .select('phone_number')
                .where({phone_number: phoneNumber})
                .limit(1)
                .then((rows) => {
                    const isAvailable = rows.length == 0;
                    redisClient.client.set(cacheKey, isAvailable); //Set the cache value
                    if (isAvailable) {
                        return res.status(200).send();
                    } else {
                        return res.status(409).send();
                    }
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(500).send({success: false, message: `An error occured: ${error.message}`});
                })
            }
        })
        .catch((err) => {
            return res.status(500).send({success: false, message: `An error occured: ${err.message}`})
        });
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
                const cacheKey = `verified-phone-number-${phoneNumber}`;
                redisClient.client.set(cacheKey, token).then((_) => console.log("Cache Set the token that verifies a users phone number"));                
                console.log("Verification Token verified!");
                return res.status(200).send({success: true, message: `Verification Token verified: ${verificationChecks.status}`});
            }
        });
    } else {
        return res.status(400).send();
    }
});

fastify.post('/signup', (req, res) => {
    let phoneNumber = req.body['phone_number'];
    const countryCode = req.body['country_code'];
    phoneNumber = phone(phoneNumber, {country: countryCode})["phoneNumber"];
    if (phoneNumber !== null && phoneNumber !== undefined) {
        const cacheKey = `verified-phone-number-${phoneNumber}`;
        redisClient.client.get(cacheKey)
        .then((token) => {
            if (token) {
                knex('users').insert({phone_number: phoneNumber}, ['id', 'uuid', 'created_at', 'updated_at', 'avatar_url', 'display_name'])
                .then((rows) => {
                    if (rows.length > 0) {
                        const user = rows[0];
                        console.log(user);
                        const id = parseInt(user["id"]); const uuid = user["uuid"];
                        console.log(`This is the userId: ${id}. This is the uuid ${uuid}`);
                        const token = fastify.jwt.sign({id: id, uuid: uuid}, {expiresIn: '365 days'})
                        redisClient.client.del(cacheKey).then((_) => {console.log(`Finished deleting: ${cacheKey} from the cache`)});
                        return res.status(201).send({user: user, access: token});
                    } else {
                        return res.status(500).send({message: `An error occured: Couldn't create new user`});
                    }
                }).catch((err) => {
                    return res.status(500).send({success: false, message: `An error occured: ${err.message}`})
                });
            } else {
                return res.status(401).send({message: `Token wasn't verified`});
            }
        })
        .catch((err) => {
            return res.status(500).send({success: false, message: `An error occured: ${err.message}`})
        });
    } else {
        return res.status(400).send({message: `Bad Request: missing phone number`}); 
    }
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
    .then((isAvailable) => {
        if (isAvailable.length > 0) {
            return res.status(200).send(isAvailable);
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
    .then((isAvailable) => {
        if (isAvailable.length > 0) {
            const user = isAvailable[0];
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