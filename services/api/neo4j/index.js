'use-strict'
const neo4j = require('neo4j-driver');
const uri = process.env.NEO4JURI;
const user = process.env.NEO4JUSERNAME;
const password = process.env.NEO4JPASSWORD;
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
module.exports = { driver }