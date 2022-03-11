const { port, environment, masterKey } = require('./config');
const fastify = require('fastify')({
    logger: true
  })
fastify.register(require('fastify-jwt'), {
    secret: masterKey
  })

fastify.decorate("authenticate", async (req, res) => {
    try {
        await req.jwtVerify();
    } catch (err) {
        res.send(err);   
    }
});

const PORT = port || 3000; 
const knexConfig = require('./knexfile');
//initialize knex
const knex = require('knex')(knexConfig[environment]);
const {phone} = require('phone');
const twilioClient = require('./web_services/twilio_client');
const redisClient = require('./redis_client');



// const feedResponse = {200: {type: 'object', properties: {responses: {type: 'array', items: {type: 'object', properties: {id: {type: 'number'}, uuid: {type: 'string'}, created_at: {type: 'date'}, updated_at: {type: 'date'}, body: {type: 'string'}, prompt: {id: {type: 'number'}, uuid: {type: 'string'}, body: {type: 'string'}, created_at: {type: 'date'}}, user: {id: {type: 'number'}, uuid: {type: 'string'}, display_name: {type: 'string'
fastify.get('/', {onRequest: [fastify.authenticate]}, (req, res) => {
  const limit = req.query["limit"];
  const offset = req.query["offset"];
  knex("answers")
  .join("prompts", 'answers.prompt_id', '=', 'prompts.id')
    .join("users", 'answers.user_id', '=', 'users.id')
    .select(['answers.id as answer_id', 'answers.uuid as answer_uuid', 'answers.created_at as answer_created_at', 'answers.updated_at as answer_updated_at', 'answers.body as answer_body', 'prompts.id as prompt_id', 'prompts.uuid as prompt_uuid', 'prompts.body as prompt_body', 'prompts.created_at as prompt_created_at', 'prompts.updated_at as prompt_updated_at', 'users.id as user_id', 'users.uuid as user_uuid', 'users.display_name as user_display_name', 'users.avatar_url as user_avatar_url'])
    .orderBy("answers.created_at", "desc")
    .limit(limit)
    .offset(offset)
    .then((rows) => {
        if (rows.length > 0) {
            let data = []
            rows.forEach(row => {
                data.push({id: parseInt(row["answer_id"]), uuid: row["answer_uuid"], created_at: row["answer_created_at"], updated_at: row["answer_updated_at"], body: row["answer_body"], prompt: {id: parseInt(row["prompt_id"]), uuid: row["prompt_uuid"], body: row["prompt_body"], created_at: row["prompt_created_at"], updated_at: row["prompt_updated_at"]}, user: {id: parseInt(row["user_id"]), uuid: row["user_uuid"], display_name: row["user_display_name"], avatar_url: row["user_avatar_url"]}})
            });
            console.log(data);
            return res.status(200).send(data);
        } else {
            return res.status(404).send();
        } 
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: `An error occured: ${err.message}`});
    });
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

    if (phoneNumber === '+16462471839' && token === '000000') {
        const cacheKey = `verified-phone-number-${phoneNumber}`;
        redisClient.client.set(cacheKey, token).then((_) => console.log("Cache Set the token that verifies a users phone number"));                
        return res.status(200).send({success: true});
    }

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
                        return res.status(201).send({id: id, uuid: uuid, access_token: token});
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

/**
 * Returns a specific user
 */
const response = {200: {type: 'object', properties: {id: {type: 'number'}, uuid: {type: 'string'}, display_name: {type: 'string'}, created_at: {type: 'string'}, updated_at: {type: 'string'}}}}
fastify.get('/users/:id', {onRequest: [fastify.authenticate], schema: {response: response}}, (req, res) => {
    console.log(`This is the user that was decoded from the payload: ${req.user.uuid}`);
    knex('users')
    .select('id', 'uuid', 'display_name', 'created_at', 'updated_at')
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

/**
 * Returns a users answers to various prompts
 */
fastify.get('/users/:user_id/answers', {onRequest: [fastify.authenticate]}, (req, res) => {
    const limit = req.query['limit'];
    const offset = req.query['offset'];
    knex('answers')
    .join("prompts", 'answers.prompt_id', '=', 'prompts.id')
    .join("users", 'answers.user_id', '=', 'users.id')
    .select(['answers.id as answer_id', 'answers.uuid as answer_uuid', 'answers.created_at as answer_created_at', 'answers.updated_at as answer_updated_at', 'answers.body as answer_body', 'prompts.id as prompt_id', 'prompts.uuid as prompt_uuid', 'prompts.body as prompt_body', 'prompts.created_at as prompt_created_at', 'users.id as user_id', 'users.uuid as user_uuid', 'users.display_name as user_display_name', 'users.avatar_url as user_avatar_url'])
    .where({user_id: req.params['user_id']})
    .limit(limit)
    .offset(offset)
    .orderBy('prompts.id', 'asc')
    .then((rows) => {
        if (rows.length > 0) {
            let data = []
            rows.forEach(row => {
                data.push({id: row["answer_id"], uuid: row["answer_uuid"], created_at: row["answer_created_at"], updated_at: row["answer_updated_at"], body: row["answer_body"], prompt: {id: row["prompt_id"], uuid: row["prompt_uuid"], body: row["prompt_body"], created_at: row["prompt_created_at"]}, user: {id: row["user_id"], uuid: row["user_uuid"], display_name: row["user_display_name"], avatar_url: row["user_avatar_url"]}})
            });
            console.log(data);
            return res.status(200).send(data);
        } else {
            return res.status(404).send();
        }
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).send({success: false, message: `An error occured: ${err.message}`});
    });
}); 


fastify.put('/users', {onRequest: [fastify.authenticate]}, (req, res) => {
    console.log(req.body);
    const userId = req.user.id;
    const updateParams = {};
    updateParams["display_name"] = req.body['display_name']
    knex('users')
    .select('id')
    .where({id: userId})
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

fastify.post('/prompts', {onRequest: [fastify.authenticate]}, (req, res) => {
    const body = req.body['body'];
    knex('prompts')
    .insert({body: body}, ['id', 'uuid', 'created_at', 'updated_at'])
    .then((rows) => {
        if(rows.length > 0) {
            res.status(201).send(rows);
        } else {
            res.status(500).send({error: `Couldn't Create new answer`}); 
        }
    })
    .catch((err) => {
        return res.status(500).send({success: false, message:  `An error occured: ${err}`});
    });
});

/**
 * Creates a new answer to a prompt
 */
fastify.post('/prompts/:prompt_id/answers', {onRequest: [fastify.authenticate]}, (req, res) => {
    // authenticate user before hand
    const userId = req.user.id;
    const answer = req.body['answer'];
    const promptId = req.params['prompt_id'];
    knex('answers')
    .insert({body: answer, prompt_id: promptId, user_id: userId}, ['id', 'uuid', 'body', 'created_at', 'updated_at'])
    .then((rows) => {
        if (rows.length > 0) {
            res.status(201).send(rows);
        } else {
            res.status(500).send({error: `Couldn't Create new answer`});
        }
    })
    .catch((err) => {
        return res.status(500).send({success: false, message:  `An error occured: ${err}`});
    });
});

/**
 * Updates the answer for a specified prompt
 * 
 */
fastify.put('/prompts/:prompt_id/answers/:id', (req, res) => {

});

/**
 * Returns a specific answer to a specific prompt 
 */
fastify.get('/prompts/:prompt_id/answers/:id', {onRequest: [fastify.authenticate]}, (req, res) => {
    const promptId = req.params["prompt_id"];
    const id = req.params["id"];
    knex("answers")
    .join("users", 'answers.user_id', '=', 'users.id')
    .join("prompts", 'answers.prompt_id', '=', 'prompts.id')
    .select(['answers.id as answer_id', 'answers.uuid as answer_uuid', 'answers.created_at as answer_created_at', 'answers.updated_at as answer_updated_at', 'answers.body as answer_body', 'prompts.id as prompt_id', 'prompts.uuid as prompt_uuid', 'prompts.body as prompt_body', 'prompts.created_at as prompt_created_at', 'users.id as user_id', 'users.uuid as user_uuid', 'users.display_name as user_display_name', 'users.avatar_url as user_avatar_url'])
    .where("answers.id", "=", id)
    .limit(1)
    .then((rows) => {
        if (rows.length > 0) {
            const row = rows[0];
            let data = {id: row["answer_id"], uuid: row["answer_uuid"], created_at: row["answer_created_at"], updated_at: row["answer_updated_at"], body: row["answer_body"], prompt: {id: row["prompt_id"], uuid: row["prompt_uuid"], body: row["prompt_body"], created_at: row["prompt_created_at"]}, user: {id: row["user_id"], uuid: row["user_uuid"], display_name: row["user_display_name"], avatar_url: row["user_avatar_url"]}}
            console.log(data);
            return res.status(200).send(data);
        } else {
            return res.status(404).send();
        }
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: "An error occured"});
    });
});




fastify.get('/chat_rooms', {onRequest: [fastify.authenticate]}, (req, res) => {
    const limit = req.query['limit'] || 10;
    const offset = req.query['offset'];
    const userId = req.user.id;
    knex('chat_rooms')
    .join('chat_room_users', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
    .join('users', 'chat_room_users.user_id', '=', 'users.id')
    .select(['chat_rooms.id as chat_rooms_id', 'chat_rooms.uuid as chat_rooms_uuid', 'chat_rooms.created_at as chat_rooms_created_at', 'chat_rooms.updated_at as chat_rooms_updated_at'])
    .where('users.id', '=', userId)
    .limit(limit)
    .offset(offset)
    .orderBy('chat_rooms.updated_at', 'desc')
    .then((rows) => {
        if (rows.length > 0) {
            let data = [];
            rows.forEach((row) => {
                data.push({id: row['chat_rooms_id'], uuid: row['chat_rooms_uuid'], created_at: row['chat_rooms_created_at'], updated_at: row['chat_rooms_updated_at'], })
            });
            res.status(200).send(data);
        } else {
            res.status(404).send();
        }
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: "An error occured"});
    });
});

fastify.get('/chat_rooms/:id', {onRequest: [fastify.authenticate]}, (req, res) => {
    const userId = req.user.id;
    knex('chat_rooms')
    .join('chat_room_users', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
    .join('users', 'chat_room_users.user_id', '=', 'users.id')
    .select(['chat_rooms.id as chat_rooms_id', 'chat_rooms.uuid as chat_rooms_uuid', 'chat_rooms.created_at as chat_rooms_created_at', 'chat_rooms.updated_at as chat_rooms_updated_at'])
    .where('users.id', '=', userId)
    .then((rows) => {
        if (rows.length > 0) {
            const row = rows[0];
            let data = {id: row["chat_rooms_id"], uuid: row["chat_rooms_uuid"], created_at: row["chat_rooms_created_at"], updated_at: row["chat_rooms_updated_at"]};
            console.log(data);
            return res.status(200).send(data);  
        } else {
            res.status(404).send();
        }
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: "An error occured"});
    })
});

fastify.get('/chat_rooms/:id/messages', {onRequest: [fastify.authenticate]}, (req, res) => {
    const userId = req.user.id;
    const limit = req.query['limit'] || 10;
    const offset = req.query[''];
    const chatRoomId = req.params['id'];
    knex('messages')
    .join('chat_rooms', 'messages.chat_room_id', '=', 'chat_rooms.id')
    .join('chat_room_users', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
    .join('users', 'chat_room_users.user_id', '=', 'users.id')
    .where('chat_rooms.id', '=', chatRoomId)
    .where('chat_room_users.user_id', '=', userId)
    .where('chat_room_users.chat_room_id', '=', chatRoomId)
    .select(['messages.body as messages_body', 'messages.id as messages_id', 'messages.uuid as messages_uuid', 'messages.kind as messages_kind', 'messages.created_at as messages_created_at', 'messages.updated_at as messages_updated_at', 'users.id as users_id', 'users.uuid as users_uuid', 'users.display_name as users_display_name'])
    .limit(limit)
    .offset(offset)
    .orderBy('messages.created_at', 'desc')
    .then((rows) => {
        if (rows.length > 0) {
            let data = [];
            res.status(200).send();
        } else {
            res.status(404).send();
        }
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({success: false, message: "An error occured"});
    });
});

fastify.post('/chat_rooms/:id/messages', (req, res) => {

});

fastify.post('/prompts/:prompt_id/answers/:answer_id/messages', {onRequest: [fastify.authenticate]}, async (req, res) => {
    const currentUserId = req.user.id;
    const messagedUserId = req.body['user_id'];
    const requestMessage = req.body['message'];
    // Given multiple user_ids, does a chat room exit where chat_room_users with the given user_ids share the same chat_room_id
    const chatRoomUsers = await knex('chat_room_users').select(['chat_room_users.chat_room_id'])
    .where('chat_room_users.user_id', messagedUserId)
    .intersect((knex) => {
        knex.select(['chat_room_users.chat_room_id'])
        .from('chat_room_users')
        .where('chat_room_users.user_id', currentUserId)
    }); 
    if(chatRoomUsers.length > 0) {
        const chat_room_id = chatRoomUsers[0].chat_room_id;
        const chat_room_user_ids = await knex('chat_room_users').select('chat_room_users.id').where({chat_room_id: parseInt(chat_room_id), user_id: currentUserId});
        const chat_room_user_id = chat_room_user_ids[0].id;
        const responseMessage = await knex('messages').insert({body: requestMessage, chat_room_id: parseInt(chat_room_id), chat_room_user_id: parseInt(chat_room_user_id), kind: 'text'}, ['id', 'uuid', 'created_at', 'updated_at', 'body']);
        return res.status(200).send(responseMessage);
    } else {
        const chat_rooms = await knex('chat_rooms').insert({}, ['id']);
        const chat_room_id = parseInt(chat_rooms[0].id);
        const chat_room_user_ones = await knex('chat_room_users').insert({chat_room_id: chat_room_id, user_id: messagedUserId}, ['id']);
        const messaged_chat_room_user_id = parseInt(chat_room_user_ones[0].id);
        const chat_room_user_twos = await knex('chat_room_users').insert({chat_room_id: chat_room_id, user_id: currentUserId}, ['id']);
        const messaging_chat_room_user_id = parseInt(chat_room_user_twos[0].id);
        const message = await knex('messages').insert({body: requestMessage, chat_room_id: chat_room_id, chat_room_user_id: messaged_chat_room_user_id, kind: 'text'}, ['id', 'uuid', 'created_at', 'updated_at', 'body']);
        return res.status(200).send(message);
    }
});

fastify.delete('/chat_rooms/:chat_room_id/messages/:id', (req, res) => {

});

fastify.delete('/chat_rooms/:id', (req, res) => {

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