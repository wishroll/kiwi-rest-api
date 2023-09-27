import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4JURI || '',
  neo4j.auth.basic(process.env.NEO4JUSERNAME || '', process.env.NEO4JPASSWORD || ''),
);

export default driver;