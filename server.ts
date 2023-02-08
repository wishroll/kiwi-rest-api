import buildServer from './index';

const server = buildServer();
server.listen(
  {
    port: Number(process.env.PORT),
    host: '::',
  },
  (err, add) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info(`server listening on ${add}`);
  },
);
