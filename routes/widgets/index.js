const index = require('./schema/v1/index');
module.exports = async (fastify, _options) => {
  fastify.get(
    '/v1/widgets/me/tracks/received',
    { onRequest: [fastify.authenticate], schema: index },
    async (req, res) => {
      const currentUserId = req.user.id;
      const limit = req.query.limit;
      const offset = req.query.offset;
      try {
        const results = await fastify
          .readDb('tracks')
          .select([
            'tracks.track_id as track_id',
            'tracks.platform as platform',
            'tracks.artwork as artwork',
            'tracks.name as name',
            'tracks.artists as artists',
            'users.avatar_url as sender_avatar_url',
            'messages.id as message_id',
          ])
          .innerJoin('messages', 'tracks.track_id', '=', 'messages.track_id')
          .innerJoin('users', 'messages.sender_id', '=', 'users.id')
          .where('messages.recipient_id', '=', currentUserId)
          .orderBy('messages.created_at', 'desc')
          .offset(offset)
          .limit(limit);
        if (results.length > 0) {
          results.forEach(r => {
            r.artwork_url = r.artwork.url;
            r.artwork = null;
          });
          console.log(results);
          res.status(200).send(results);
        } else {
          res.status(404).send({ error: true, message: 'Not found' });
        }
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: true, message: error });
      }
    },
  );
};
