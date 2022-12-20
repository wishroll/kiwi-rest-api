'use-strict';
import neo4j from 'neo4j-driver';
const uri = String(process.env.NEO4JURI);
const user = String(process.env.NEO4JUSERNAME);
const password = String(process.env.NEO4JPASSWORD);
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
  disableLosslessIntegers: true,
});
export default driver;
