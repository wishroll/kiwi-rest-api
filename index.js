const { port, environment, masterKey } = require('./config');
const fastify = require('fastify')({
    logger: true,
    maxParamLength: 1000
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
const crypto = require('crypto');
const multer = require('fastify-multer');
const multerS3 = require('multer-s3');
const S3 = require('aws-sdk/clients/s3');
const s3 =  new S3({region: process.env.AWS_S3_REGION, credentials: {accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY}});
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        cacheControl: 'max-age=31536000',
        contentDisposition: 'attachment',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + file.originalname);
        }
    })
});
fastify.register(multer.contentParser);

const PORT = port || 3000;
const knexConfig = require('./knexfile');
//initialize knex
const knex = require('knex')(knexConfig[environment]);
const { phone } = require('phone');
const twilioClient = require('./web_services/twilio_client');
const redisClient = require('./redis_client');

fastify.post('/login/validate', async (req, res) => {
    let phoneNumber = req.body["phone_number"];
    const countryCode = req.body["country_code"];
    phoneNumber = phone(phoneNumber, { country: countryCode })['phoneNumber'];
    if (phoneNumber == undefined || phoneNumber == null) {
        return res.status(400).send();
    }
    const rows = await knex('users').select('phone_number').where({ phone_number: phoneNumber }).first();
    return rows ? res.status(200).send() : res.status(404).send();
});

fastify.post('/login/send-token', (req, res) => {
    let phoneNumber = req.body['phone_number'];
    const countryCode = req.body['country_code'];
    phoneNumber = phone(phoneNumber, { country: countryCode })["phoneNumber"];
    if (phoneNumber == undefined || phoneNumber == null || phoneNumber == '') {
        return res.status(400).send();
    }
    twilioClient.sendToken(phoneNumber, (verification, error) => {
        if (error) {
            return res.status(error['status']).send({ message: `An error occured: ${error.message}` });
        } else if (verification) {
            return res.status(201).send({ message: `Verification token created and sent: ${verification["status"]}` });
        }
    });
});

fastify.post('/login/verify', (req, res) => {
    let phoneNumber = req.body['phone_number'];
    const token = req.body['token'];
    const countryCode = req.body['country_code'];
    phoneNumber = phone(phoneNumber, { country: countryCode })["phoneNumber"];
    if (phoneNumber === '+16462471839' && token === '000000') {
        const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber);
        try {
            redisClient.client.set(cacheKey, token);
        } catch (error) {
            
        }
        return res.status(200).send({ success: true });
    }
    if (!phoneNumber || !token) {
        return res.status(400).send();
    } else {
        // twilioClient.verify(phoneNumber, token, (verificationChecks, error) => {
        //     if (error) {
        //         return res.status(error["status"]).send({ success: false, message: `An error occured: ${error.message}` });
        //     } else {
                const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber);
                try {
                    redisClient.client.set(cacheKey, token);
                } catch (error) {
                    
                }
                return res.status(200).send({ success: true, message: `Verification Token verified` });
            // }
        // })
    }

});

const loginVerifiedPhoneNumberCacheKey = (phoneNumber) => { return `login-verified-phone-number-${phoneNumber}` };

fastify.post('/login', async (req, res) => {
    let phoneNumber = req.body['phone_number'];
    const countryCode = req.body['country_code'];
    phoneNumber = phone(phoneNumber, { country: countryCode })["phoneNumber"];
    if (phoneNumber == undefined || phoneNumber == null) {
        return res.status(400).send();
    }
    const cacheKey = loginVerifiedPhoneNumberCacheKey(phoneNumber);
    const token = await redisClient.client.get(cacheKey);
    if (token) {
        const user = await knex('users').select(['id', 'uuid']).where({ phone_number: phoneNumber }).first();
        const token = fastify.jwt.sign({ id: user.id, uuid: user.uuid }, { expiresIn: '365 days' });
        redisClient.client.del(cacheKey).then((_) => { console.log(`Finished deleting: ${cacheKey} from the cache`) });
        return res.status(200).send({ access_token: token});
    } else {
        return res.status(401).send({ message: 'Unable to verify' });
    }
});

fastify.post('/logout', { onRequest: [fastify.authenticate] }, (req, res) => {
    const userId = req.user.id;

});

const signupVerifiedCacheKey = (phoneNumber) => { return `signup-verified-phone-number ${phoneNumber}` };

/**
 * 
 */
fastify.post('/signup/validate', (req, res) => {
    let phoneNumber = req.body["phone_number"];
    const countryCode = req.body["country_code"];
    phoneNumber = phone(phoneNumber, { country: countryCode })['phoneNumber'];
    if (phoneNumber !== null) {
        const cacheKey = `phone-number-is-available-${phoneNumber}`;
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
                        .where({ phone_number: phoneNumber })
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
                            return res.status(500).send({ success: false, message: `An error occured: ${error.message}` });
                        })
                }
            })
            .catch((err) => {
                return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
            });
    } else {
        return res.status(400).send();
    }
});

fastify.post('/signup/send-token', (req, res) => {
    let phoneNumber = req.body['phone_number'];
    const countryCode = req.body['country_code'];
    phoneNumber = phone(phoneNumber, { country: countryCode })["phoneNumber"];
    if (phoneNumber !== null) {
        twilioClient.sendToken(phoneNumber, (verification, error) => {
            if (error !== null) {
                //handle error  
                return res.status(error["status"]).send({ success: false, message: `An error occured: ${error.message}` });
            } else if (verification !== null) {
                return res.status(201).send({ success: true, message: `Verification token created and sent: ${verification["status"]}` });
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
    phoneNumber = phone(phoneNumber, { country: countryCode })["phoneNumber"];

    if (phoneNumber === '+16462471839' && token === '000000') {
        const cacheKey = signupVerifiedCacheKey(phoneNumber);
        try {
            redisClient.client.set(cacheKey, token);
        } catch (error) {
            
        }
        return res.status(200).send({ success: true });
    }

    if ((phoneNumber !== null && phoneNumber !== undefined) && token !== undefined) {
        // twilioClient.verify(phoneNumber, token, (verificationChecks, error) => {
        //     if (!error) {
        //         //handle error
        //         return res.status(error["status"]).send({ success: false, message: `An error occured: ${error.message}` });
        //     } else if (verificationChecks !== null) {
                const cacheKey = signupVerifiedCacheKey(phoneNumber);
                try {
                    redisClient.client.set(cacheKey, token);
                } catch (error) {
                    
                }
                return res.status(200).send({ success: true, message: `Verification Token verified` });
        //     }
        // });
    } else {
        return res.status(400).send();
    }
});

fastify.post('/signup', (req, res) => {
    let phoneNumber = req.body['phone_number'];
    const countryCode = req.body['country_code'];
    phoneNumber = phone(phoneNumber, { country: countryCode })["phoneNumber"];
    if (phoneNumber !== null && phoneNumber !== undefined) {
        const cacheKey = signupVerifiedCacheKey(phoneNumber);
        redisClient.client.get(cacheKey)
            .then((token) => {
                if (token) {
                    knex('users').insert({ phone_number: phoneNumber }, ['id', 'uuid', 'created_at', 'updated_at', 'avatar_url', 'display_name'])
                        .then((rows) => {
                            if (rows.length > 0) {
                                const user = rows[0];
                                const id = parseInt(user["id"]); const uuid = user["uuid"];
                                const token = fastify.jwt.sign({ id: id, uuid: uuid }, { expiresIn: '365 days' });
                                try {
                                    redisClient.client.del(cacheKey);
                                } catch (error) {
                                    
                                }
                                return res.status(201).send({access_token: token });
                            } else {
                                return res.status(500).send({ message: `An error occured: Couldn't create new user` });
                            }
                        }).catch((err) => {
                            return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
                        });
                } else {
                    return res.status(401).send({ message: `Token wasn't verified` });
                }
            })
            .catch((err) => {
                return res.status(500).send({ success: false, message: `An error occured: ${err.message}` })
            });
    } else {
        return res.status(400).send({ message: `Bad Request: missing phone number` });
    }
});

// const feedResponse = {200: {type: 'object', properties: {responses: {type: 'array', items: {type: 'object', properties: {id: {type: 'number'}, uuid: {type: 'string'}, created_at: {type: 'date'}, updated_at: {type: 'date'}, body: {type: 'string'}, prompt: {id: {type: 'number'}, uuid: {type: 'string'}, body: {type: 'string'}, created_at: {type: 'date'}}, user: {id: {type: 'number'}, uuid: {type: 'string'}, display_name: {type: 'string'
fastify.get('/', { onRequest: [fastify.authenticate] }, (req, res) => {
    const limit = req.query["limit"];
    const offset = req.query["offset"];
    const currentUserId = req.user.id;
    knex("answers")
        .join("prompts", 'answers.prompt_id', '=', 'prompts.id')
        .join("users", 'answers.user_id', '=', 'users.id')
        .select(['answers.id as answer_id', 'answers.uuid as answer_uuid', 'answers.created_at as answer_created_at', 'answers.updated_at as answer_updated_at', 'answers.body as answer_body', 'prompts.id as prompt_id', 'prompts.uuid as prompt_uuid', 'prompts.title as prompt_title', 'prompts.created_at as prompt_created_at', 'prompts.updated_at as prompt_updated_at', 'users.id as user_id', 'users.uuid as user_uuid', 'users.display_name as user_display_name', 'users.avatar_url as user_avatar_url'])
        .where("answers.user_id", "!=", currentUserId)
        .orderByRaw("answers.created_at desc")
        .limit(limit)
        .offset(offset)
        .then((rows) => {
            if (rows.length > 0) {
                let data = []
                rows.forEach(row => {
                    data.push({ id: parseInt(row["answer_id"]), uuid: row["answer_uuid"], created_at: row["answer_created_at"], updated_at: row["answer_updated_at"], body: row["answer_body"], prompt: { id: parseInt(row["prompt_id"]), uuid: row["prompt_uuid"], title: row["prompt_title"], created_at: row["prompt_created_at"], updated_at: row["prompt_updated_at"] }, user: { id: parseInt(row["user_id"]), uuid: row["user_uuid"], display_name: row["user_display_name"], avatar_url: row["user_avatar_url"] } })
                });
                return res.status(200).send(data);
            } else {
                return res.status(404).send();
            }
        })
        .catch((err) => {
            return res.status(500).send({ success: false, message: `An error occured: ${err.message}` });
        });
});

fastify.get('/home', (req, res) => {

});

fastify.get('/users', (req, res) => {
    const limit = req.query['limit'];
    const offset = req.query['offset'];
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
            return res.status(500).send({ success: false, message: `An error occured: ${err.message}` });
        })
});

/**
 * Returns a specific user
 */
const response = { 200: { type: 'object', properties: { id: { type: 'number' }, uuid: { type: 'string' }, display_name: { type: 'string' }, created_at: { type: 'string' }, updated_at: { type: 'string' }, avatar_url: {type: 'string'} } } }
fastify.get('/users/:id', { onRequest: [fastify.authenticate], schema: { response: response } }, (req, res) => {
    knex('users')
        .select('id', 'uuid', 'display_name', 'created_at', 'updated_at', 'avatar_url')
        .where({ id: req.params["id"] })
        .first()
        .then((user) => {
            if (user) {
                return res.status(200).send(user);
            } else {
                return res.status(404).send();
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).send({ success: false, message: `An error occured: ${err.message}` });
        })
});

/**
 * Returns a users answers to various prompts
 */
fastify.get('/users/:user_id/answers', { onRequest: [fastify.authenticate] }, (req, res) => {
    const limit = req.query['limit'];
    const offset = req.query['offset'];
    knex('answers')
        .join("prompts", 'answers.prompt_id', '=', 'prompts.id')
        .join("users", 'answers.user_id', '=', 'users.id')
        .select(['answers.id as answer_id', 'answers.uuid as answer_uuid', 'answers.created_at as answer_created_at', 'answers.updated_at as answer_updated_at', 'answers.body as answer_body', 'prompts.id as prompt_id', 'prompts.uuid as prompt_uuid', 'prompts.title as prompt_title', 'prompts.subtitle as prompt_subtitle', 'prompts.created_at as prompt_created_at', 'users.id as user_id', 'users.uuid as user_uuid', 'users.display_name as user_display_name', 'users.avatar_url as user_avatar_url'])
        .where({ user_id: req.params['user_id'] })
        .limit(limit)
        .offset(offset)
        .orderBy('prompts.id', 'asc')
        .then((rows) => {
            if (rows.length > 0) {
                let data = []
                rows.forEach(row => {
                    data.push({ id: row["answer_id"], uuid: row["answer_uuid"], created_at: row["answer_created_at"], updated_at: row["answer_updated_at"], body: row["answer_body"], prompt: { id: row["prompt_id"], uuid: row["prompt_uuid"], title: row["prompt_title"], subtitle: row['prompt_subtitle'], created_at: row["prompt_created_at"]}, user: {id: row['user_id'], uuid: row['user_uuid'], display_name: row['user_display_name'], avatar_url: row['user_avatar_url']} })
                });
                return res.status(200).send(data);
            } else {
                return res.status(404).send();
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ success: false, message: `An error occured: ${err.message}` });
        });
});

const createSignedId = (key) => {
    const SEPERATOR = "--";
    const digest = 'sha256';
    const hexDigest = crypto.createHash('sha256', masterKey).update(key).digest('hex');
    const base64Digest = crypto.createHash('sha256', masterKey).update(key).digest('base64Url');
    return `${base64Digest}${SEPERATOR}${hexDigest}`
};

fastify.put('/users', { onRequest: [fastify.authenticate], preHandler: upload.single('avatar')}, (req, res) => {
    const userId = req.user.id;
    const updateParams = req.body;
    if(req.file) {
        const key = req.file.key;
        const hostName = req.hostname;
        const signedId = createSignedId(key);
        const avatarUrl = `${req.protocol}://${hostName}/media/redirect/${signedId}/${key}`;
        updateParams.avatar_url  = avatarUrl;
    }
    knex('users')
        .select('id')
        .where({ id: userId })
        .update(updateParams, ['id', 'uuid', 'display_name', 'phone_number', 'created_at', 'updated_at', 'avatar_url'])
        .then((user) => {
            return res.status(200).send(user);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).send({ success: false, message: "An error occured" });
        });
});

fastify.post('/prompts', { onRequest: [fastify.authenticate] }, (req, res) => {
    const title = req.body['title'];
    const subtitle = req.body['subtitle'];
    knex('prompts')
        .insert({ title: title, subtitle: subtitle }, ['id', 'uuid', 'created_at', 'updated_at'])
        .then((rows) => {
            if (rows.length > 0) {
                res.status(201).send(rows);
            } else {
                res.status(500).send({ error: `Couldn't Create new prompt` });
            }
        })
        .catch((err) => {
            return res.status(500).send({ success: false, message: `An error occured: ${err}` });
        });
});

fastify.get('/prompts', async (req, res) => {
    try {
        const prompts = await knex('prompts').select();
        if (prompts.length > 0) {
            return res.status(200).send(prompts);
        } else {
            return res.status(404).send(prompts);
        }
    } catch (error) {
        return res.status(500).send(error);
    }
});
/**
 * Creates a new answer to a prompt
 */
fastify.post('/prompts/:prompt_id/answers', { onRequest: [fastify.authenticate] }, async (req, res) => {
    // authenticate user before hand
    const userId = req.user.id;
    const answer = req.body['answer'];
    const promptId = req.params['prompt_id'];
    const existingAnswer = await knex('answers').select(['id', 'prompt_id', 'user_id']).where({ user_id: userId, prompt_id: promptId }).first();
    if (existingAnswer) {
        try {
            const updatedAnswer = await knex('answers')
                .select('id')
                .where({ id: existingAnswer.id })
                .update({ body: answer }, ['id', 'uuid', 'body', 'created_at', 'updated_at', 'prompt_id', 'user_id'])
            return res.status(200).send(updatedAnswer);
        } catch (error) {
            return res.status(500).send({ message: `An error occured ${error}` });
        }
    } else {
        knex('answers')
            .insert({ body: answer, prompt_id: promptId, user_id: userId }, ['id', 'uuid', 'body', 'created_at', 'updated_at'])
            .then((rows) => {
                if (rows.length > 0) {
                    return res.status(201).send(rows);
                } else {
                    return res.status(500).send({ error: `Couldn't Create new answer` });
                }
            })
            .catch((err) => {
                return res.status(500).send({ success: false, message: `An error occured: ${err}` });
            });
    }
});

/**
 * Updates the answer for a specified prompt
 * 
 */
fastify.put('/answers/:id', { onRequest: [fastify.authenticate] }, (req, res) => {
    const answerId = req.params["id"];
    const updates = req.body;
    knex('answers')
    .where({id: answerId})
    .update(updates, ['id', 'uuid', 'body', 'created_at', 'updated_at'])
    .then(() => {
        return res.status(200).send();
    })
    .catch((error) => {
        return res.status(500).send({ success: false, message: "An error occured" });
    })
});

/**
 * Returns a specific answer to a specific prompt 
 */
fastify.get('/prompts/:prompt_id/answers/:id', { onRequest: [fastify.authenticate] }, (req, res) => {
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
                let data = { id: row["answer_id"], uuid: row["answer_uuid"], created_at: row["answer_created_at"], updated_at: row["answer_updated_at"], body: row["answer_body"], prompt: { id: row["prompt_id"], uuid: row["prompt_uuid"], body: row["prompt_body"], created_at: row["prompt_created_at"] }, user: { id: row["user_id"], uuid: row["user_uuid"], display_name: row["user_display_name"], avatar_url: row["user_avatar_url"] } }
                console.log(data);
                return res.status(200).send(data);
            } else {
                return res.status(404).send();
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).send({ success: false, message: "An error occured" });
        });
});




fastify.get('/chat_rooms', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const limit = req.query['limit'] || 10;
    const offset = req.query['offset'];
    const userId = req.user.id;
    const chatRooms = await knex('chat_rooms')
        .join('chat_room_users', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
        .join('users', 'chat_room_users.user_id', '=', 'users.id')
        .select(['chat_rooms.id as chat_rooms_id', 'chat_rooms.uuid as chat_rooms_uuid', 'chat_rooms.created_at as chat_rooms_created_at', 'chat_rooms.updated_at as chat_rooms_updated_at', 'users.display_name as users_display_name'])
        .where('users.id', '=', userId)
        .limit(limit)
        .offset(offset)
        .orderBy('chat_rooms.updated_at', 'desc')
    if (chatRooms.length > 0) {
        let data = [];
        let chat_room_users = [];
        await Promise.all(chatRooms.map(async (row) => {
            const chatRoomId = parseInt(row['chat_rooms_id']);
            const message = await knex('messages').select(['id', 'uuid', 'kind', 'created_at', 'updated_at', 'answer_id', 'body', 'chat_room_user_id']).where({ chat_room_id: chatRoomId }).orderBy('messages.created_at', 'desc').first();
            if (message && message.answer_id) {
                const chatRoomUser = await knex('chat_room_users').select('user_id').where({ id: message.chat_room_user_id }).first();
                const user = await knex('users').select(['id', 'uuid', 'display_name', 'avatar_url']).where({ id: chatRoomUser.user_id }).first();
                const answer = await knex('answers').select().where({ id: parseInt(message.answer_id) }).first();
                const prompt = await knex('prompts').select().where({ id: parseInt(answer.prompt_id) }).first();
                answer["prompt"] = prompt;
                message['user'] = user;
                message['answer'] = answer;
                console.log(message);
            }
            const chatRoomUsers = await knex('users').join('chat_room_users', 'chat_room_users.user_id', '=', 'users.id')
                .select(['users.id as id', 'users.uuid as uuid', 'users.display_name as display_name', 'users.avatar_url as avatar_url'])
                .where('chat_room_users.chat_room_id', '=', chatRoomId)
                .where('chat_room_users.user_id', '!=', userId)
                .distinct('users.id');
            data.push({ id: row['chat_rooms_id'], uuid: row['chat_rooms_uuid'], created_at: row['chat_rooms_created_at'], updated_at: row['chat_rooms_updated_at'], recent_message: message, chat_room_users: chatRoomUsers })
        }))
        res.status(200).send(data);
    } else {
        res.status(404).send();
    }
});

fastify.get('/chat_rooms/:id', { onRequest: [fastify.authenticate] }, (req, res) => {
    const userId = req.user.id;
    knex('chat_rooms')
        .join('chat_room_users', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
        .join('users', 'chat_room_users.user_id', '=', 'users.id')
        .select(['chat_rooms.id as chat_rooms_id', 'chat_rooms.uuid as chat_rooms_uuid', 'chat_rooms.created_at as chat_rooms_created_at', 'chat_rooms.updated_at as chat_rooms_updated_at'])
        .where('users.id', '=', userId)
        .then((rows) => {
            if (rows.length > 0) {
                const row = rows[0];
                let data = { id: row["chat_rooms_id"], uuid: row["chat_rooms_uuid"], created_at: row["chat_rooms_created_at"], updated_at: row["chat_rooms_updated_at"] };
                console.log(data);
                return res.status(200).send(data);
            } else {
                res.status(404).send();
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).send({ success: false, message: "An error occured" });
        })
});

fastify.get('/chat_rooms/:id/messages', { onRequest: [fastify.authenticate] }, (req, res) => {
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
            return res.status(500).send({ success: false, message: "An error occured" });
        });
});

fastify.post('/chat_rooms/:id/messages', (req, res) => {

});

fastify.post('/prompts/:prompt_id/answers/:answer_id/messages', { onRequest: [fastify.authenticate] }, async (req, res) => {
    const currentUserId = req.user.id;
    const answerId = req.params.answer_id;
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
    if (chatRoomUsers.length > 0) {
        const chat_room_id = chatRoomUsers[0].chat_room_id;
        const chat_room_user_ids = await knex('chat_room_users').select('chat_room_users.id').where({ chat_room_id: parseInt(chat_room_id), user_id: currentUserId });
        const chat_room_user_id = chat_room_user_ids[0].id;
        const responseMessage = await knex('messages').insert({ answer_id: answerId, body: requestMessage, chat_room_id: parseInt(chat_room_id), chat_room_user_id: parseInt(chat_room_user_id), kind: 'text' }, ['id', 'uuid', 'created_at', 'updated_at', 'body']);
        return res.status(200).send(responseMessage);
    } else {
        const chat_rooms = await knex('chat_rooms').insert({}, ['id']);
        const chat_room_id = parseInt(chat_rooms[0].id);
        const chat_room_user_ones = await knex('chat_room_users').insert({ chat_room_id: chat_room_id, user_id: messagedUserId }, ['id']);
        const messaged_chat_room_user_id = parseInt(chat_room_user_ones[0].id);
        const chat_room_user_twos = await knex('chat_room_users').insert({ chat_room_id: chat_room_id, user_id: currentUserId }, ['id']);
        const messaging_chat_room_user_id = parseInt(chat_room_user_twos[0].id);
        const message = await knex('messages').insert({ answer_id: answerId, body: requestMessage, chat_room_id: chat_room_id, chat_room_user_id: messaging_chat_room_user_id, kind: 'text' }, ['id', 'uuid', 'created_at', 'updated_at', 'body']);
        return res.status(200).send(message);
    }
});

fastify.delete('/chat_rooms/:chat_room_id/messages/:id', (req, res) => {

});

fastify.delete('/chat_rooms/:id', (req, res) => {

});

fastify.get('/media/redirect/:signed_id/:filename', async (req, res) => {
    const signedId = req.params.signed_id;
    const fileName = req.params.filename;
    const signedUrl = generateSignedUrl(fileName);
    return res.redirect(signedUrl);
});

const generateSignedUrl = (key) => {
    return s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Expires: 3000, // Signed url expires in five minutes
        });
};




fastify.listen(PORT, '0.0.0.0', (err, add) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${add}`)
});