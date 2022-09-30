// @ts-nocheck
// TODO: Create interfaces for every schema and remove nocheck

import { FastifyReply, FastifyRequest } from 'fastify';
import { getAllUserFriendIds } from '../../utils/friends';
import { MAX_BIGINT } from '../../utils/numbers';
import { WishrollFastifyInstance } from '../index';
import {
  receivedMessagesIndex as receivedMessagesIndexV2,
  sentTracksIndex as sentTracksIndexV2,
} from './schema/v2';

module.exports = async (fastify: WishrollFastifyInstance) => {
  const {
    receivedMessagesIndex,
    sentTracksIndex,
    sentMessagesIndex,
  } = require('./schema/v1/index');
  const { show } = require('./schema/v1/show');
  const create = require('./schema/v1/create');
  const jsf = require('json-schema-faker');
  const { sendNotificationOnReceivedSong } = require('../../services/notifications/notifications');

  fastify.get(
    '/v1/me/messages',
    { onRequest: [fastify.authenticate], schema: receivedMessagesIndex },
    async (
      req: FastifyRequest<{
        Querystring: { limit: number; offset: number };
      }>,
      res: FastifyReply,
    ) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const limit = req.query.limit;
      const offset = req.query.offset;

      const cacheKey = `get-v1-me-messages-${currentUserId}-${limit}-${offset}`;

      const cachedResponse = await fastify.redisClient.get(cacheKey);
      if (cachedResponse) {
        return res.status(200).send(JSON.parse(cachedResponse));
      }

      try {
        const messages = await fastify
          .readDb('messages')
          .where('messages.recipient_id', currentUserId)
          .offset(offset)
          .limit(limit)
          .orderBy('messages.created_at', 'desc');
        if (messages.length < 1) {
          return res.status(200).send([]);
        }
        const trackIds = messages.map(m => m.track_id);
        const messageIds = messages.map(m => m.id);
        const userIds = messages.map(m => m.sender_id);
        const tracks = await fastify.readDb('tracks').select().whereIn('track_id', trackIds);
        const ratings = await fastify.readDb('ratings').select().whereIn('message_id', messageIds);
        const users = await fastify.readDb('users').select().whereIn('id', userIds);
        const data = messages.map(message => {
          message.track = tracks.find(v => v.track_id === message.track_id);
          message.rating = ratings.find(v => v.message_id === message.id);
          message.is_rated = message.rating !== undefined;
          message.sender = users.find(v => v.id === message.sender_id);
          return message;
        });

        fastify.redisClient.set(cacheKey, JSON.stringify(data), {
          EX: 60 * 1,
        });

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get(
    '/v2/me/messages',
    { onRequest: [fastify.authenticate], schema: receivedMessagesIndexV2 },
    async (
      req: FastifyRequest<{
        Querystring: { limit: number; lastId?: number };
      }>,
      res: FastifyReply,
    ) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const limit = req.query.limit;
      const lastId = req.query.lastId ?? MAX_BIGINT;

      const cacheKey = `get-v2-me-messages-${currentUserId}-${limit}-${lastId}`;

      const cachedResponse = await fastify.redisClient.get(cacheKey);

      if (cachedResponse) {
        return res.status(200).send(JSON.parse(cachedResponse));
      }

      try {
        const messages = await fastify
          .readDb('messages')
          .where('messages.recipient_id', currentUserId)
          .andWhere('messages.id', '<', lastId)
          .orderBy('messages.id', 'desc')
          .limit(limit);
        if (messages.length < 1) {
          return res.status(200).send([]);
        }

        let trackIds = [];
        let messageIds = [];
        let userIds = [];

        messages.forEach(({ track_id, id, sender_id }) => {
          trackIds = [...trackIds, track_id];
          messageIds = [...messageIds, id];
          userIds = [...userIds, sender_id];
        });

        const tracks = await fastify.readDb('tracks').select().whereIn('track_id', trackIds);
        const ratings = await fastify.readDb('ratings').select().whereIn('message_id', messageIds);
        const users = await fastify.readDb('users').select().whereIn('id', userIds);

        const data = messages.map(message => {
          const rating = ratings.find(rating => rating.message_id === message.id);
          const isMessageRated = rating !== undefined;

          return {
            ...message,
            track: tracks.find(track => track.track_id === message.track_id),
            rating,
            is_rated: isMessageRated,
            sender: users.find(user => user.id === message.sender_id),
          };
        });

        fastify.redisClient.set(cacheKey, JSON.stringify(data), {
          EX: 60 * 1,
        });

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get(
    '/v1/me/messages/sent',
    { onRequest: [fastify.authenticate], schema: sentMessagesIndex },
    async (req, res) => {
      const limit = req.query.limit;
      const offset = req.query.offset;
      const currentUserId = req.user.id;

      const cacheKey = `get-v1-me-messages-sent-${currentUserId}-${limit}-${offset}`;
      const cachedResponse = await fastify.redisClient.get(cacheKey);

      if (cachedResponse) {
        return res.status(200).send(JSON.parse(cachedResponse));
      }

      try {
        const messages = await fastify
          .readDb('messages')
          .where('messages.sender_id', currentUserId)
          .offset(offset)
          .limit(limit)
          .orderBy('messages.created_at', 'desc');
        if (messages.length < 1) {
          return res.status(200).send([]);
        }
        const trackIds = messages.map(m => m.track_id);
        const messageIds = messages.map(m => m.id);
        const recipientIds = messages.map(m => m.recipient_id);
        const currentUser = await fastify
          .readDb('users')
          .select()
          .where({ id: currentUserId })
          .first();
        const tracks = await fastify.readDb('tracks').select().whereIn('track_id', trackIds);
        const ratings = await fastify.readDb('ratings').select().whereIn('message_id', messageIds);
        const recipientUsers = await fastify.readDb('users').select().whereIn('id', recipientIds);
        const data = messages.map(message => {
          message.track = tracks.find(v => v.track_id === message.track_id);
          message.rating = ratings.find(v => v.message_id === message.id);
          message.is_rated = message.rating !== undefined;
          message.sender = currentUser;
          message.recipient = recipientUsers.find(v => v.id === message.recipient_id);
          return message;
        });
        fastify.redisClient.set(cacheKey, JSON.stringify(data), {
          EX: 60 * 1,
        });
        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get(
    '/v1/users/:id/messages/sent',
    { onRequest: [fastify.authenticate], schema: sentTracksIndex },
    async (
      req: FastifyRequest<{
        Querystring: {
          limit: number;
          offset: number;
        };
        Params: {
          id: number;
        };
      }>,
      res,
    ) => {
      const limit = req.query.limit;
      const offset = req.query.offset;
      const userId = req.params.id;

      const currentUserId = req.user.id;

      const cacheKey = `get-v1-users-${userId}-messages-sent-${limit}-${offset}-${currentUserId}`;
      const cachedResponse = await fastify.redisClient.get(cacheKey);
      if (cachedResponse) {
        return res.status(200).send(JSON.parse(cachedResponse));
      }

      try {
        const tracks = await fastify.readDb
          .select('*')
          .from(
            fastify
              .readDb('tracks')
              .select([
                'tracks.id as id',
                'tracks.uuid as uuid',
                'tracks.track_id as track_id',
                'tracks.external_url as external_url',
                'tracks.preview_url as preview_url',
                'tracks.uri as uri',
                'tracks.href as href',
                'tracks.name as name',
                'tracks.duration as duration',
                'tracks.track_number as track_number',
                'tracks.release_date as release_date',
                'tracks.isrc as isrc',
                'tracks.explicit as explicit',
                'tracks.artwork as artwork',
                'tracks.artists as artists',
                'tracks.platform as platform',
                'messages.id as message_id',
                'messages.created_at as message_created_at',
                'messages.updated_at as message_updated_at',
                'messages.text as message_text',
                'messages.track_id as message_track_id',
                'messages.recipient_id as recipient_id',
              ])
              .innerJoin('messages', 'tracks.track_id', '=', 'messages.track_id')
              .where('messages.sender_id', userId)
              .distinctOn('isrc')
              .as('tracks'),
          )
          .orderBy('tracks.message_created_at', 'desc')
          .limit(limit)
          .offset(offset);
        const data = tracks.map(track => {
          console.log(track.message_created_at);
          return { track };
        });

        fastify.redisClient.set(cacheKey, JSON.stringify(data), {
          EX: 60 * 1,
        });

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get(
    '/v2/users/:id/tracks/sent',
    { onRequest: [fastify.authenticate], schema: sentTracksIndexV2 },
    async (
      req: FastifyRequest<{
        Querystring: {
          limit: number;
          lastId?: number;
        };
        Params: {
          id: number;
        };
      }>,
      res,
    ) => {
      const limit = req.query.limit;
      const lastId = req.query.lastId ?? MAX_BIGINT;
      const userId = req.params.id;

      try {
        const tracks = await fastify.readDb
          .select('*')
          .from(
            fastify
              .readDb('tracks')
              .select([
                'tracks.id as id',
                'tracks.uuid as uuid',
                'tracks.track_id as track_id',
                'tracks.external_url as external_url',
                'tracks.preview_url as preview_url',
                'tracks.uri as uri',
                'tracks.href as href',
                'tracks.name as name',
                'tracks.duration as duration',
                'tracks.track_number as track_number',
                'tracks.release_date as release_date',
                'tracks.isrc as isrc',
                'tracks.explicit as explicit',
                'tracks.artwork as artwork',
                'tracks.artists as artists',
                'tracks.platform as platform',
                'messages.id as message_id',
                'messages.created_at as message_created_at',
                'messages.updated_at as message_updated_at',
                'messages.text as message_text',
                'messages.track_id as message_track_id',
                'messages.recipient_id as recipient_id',
              ])
              .innerJoin('messages', 'tracks.track_id', '=', 'messages.track_id')
              .where('messages.sender_id', userId)
              .distinctOn('isrc')
              .as('tracks'),
          )
          .where('id', '<', lastId ?? MAX_BIGINT)
          .orderBy('tracks.message_created_at', 'desc')
          .limit(limit);

        const data = tracks.map(track => {
          return { track };
        });

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get(
    '/v1/messages/:id',
    { onRequest: [fastify.authenticate], schema: show },
    async (req, res) => {
      const currentUserId = req.user.id;
      const messageId = req.params.id;

      const cacheKey = `get-v1-messages-${messageId}-${currentUserId}`;
      const cachedResponse = await fastify.redisClient.get(cacheKey);
      if (cachedResponse) {
        return res.status(200).send(JSON.parse(cachedResponse));
      }

      try {
        const message = await fastify.readDb('messages').where({ id: messageId }).first();

        if (!message) {
          res.status(404).send({ error: true, message: 'Not found' });
          return;
        }
        if (message.sender_id !== currentUserId && message.recipient_id !== currentUserId) {
          res.status(403).send({ error: true, message: 'Forbidden' });
          return;
        }

        const [track, rating, sender, recipient] = await Promise.all([
          fastify.readDb('tracks').where({ track_id: message.track_id }).first(),
          fastify.readDb('ratings').where({ message_id: message.id }).first(),
          fastify.readDb('users').where({ id: message.sender_id }).first(),
          fastify.readDb('users').where({ id: message.recipient_id }).first(),
        ]);
        message.track = track;
        message.rating = rating;
        message.is_rated = rating !== undefined;
        message.sender = sender;
        if (currentUserId !== message.user_id) message.recipient = recipient; //return recipient if the current user isn't equal to the

        fastify.redisClient.set(cacheKey, JSON.stringify(message), {
          EX: 60 * 1,
        });
        res.status(200).send(message);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.post(
    '/v1/messages',
    { onRequest: [fastify.authenticate], schema: create },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const { recipient_ids, track, text, send_to_all } = req.body;

      try {
        const recipientIds = send_to_all
          ? await getAllUserFriendIds(fastify, currentUserId)
          : recipient_ids;
        const recipients = await fastify.readDb('users').select('id').whereIn('id', recipientIds);
        if (recipients.length < 1) {
          return res.status(400).send({
            error: true,
            message: `Recipients could not be found for the given ids: ${recipientIds.toString()}`,
          });
        }
        let trackId: any;
        const existingTrack = await fastify
          .readDb('tracks')
          .select()
          .where({ track_id: track.track_id, platform: track.platform })
          .first();
        if (existingTrack) {
          insertIntoSpotifyTracks(existingTrack);
          trackId = existingTrack.track_id;
        } else {
          const results = await fastify.writeDb('tracks').insert(track, ['*']);
          if (!results || results.length < 1) {
            return res.status(500).send({ error: true, message: 'Could not create a new track' });
          } else {
            trackId = results[0].track_id;
            insertIntoSpotifyTracks(results[0]);
          }
        }
        const insertData = await Promise.all(
          recipients.map(async recipient => {
            const id = recipient.id;
            return { sender_id: currentUserId, recipient_id: id, track_id: trackId, text };
          }),
        );
        const messages = await fastify.writeDb('messages').insert(insertData, ['*']);
        await Promise.all(
          messages.map(async message => {
            sendNotificationOnReceivedSong(message.id, currentUserId, message.recipient_id).catch();
          }),
        );
        if (messages.length > 0) {
          res.status(201).send();
        } else {
          res.status(400).send({ error: true, message: 'Failed to create messages' });
        }
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  function insertIntoSpotifyTracks(existingTrack) {
    fastify
      .readDb('spotify_tracks')
      .select('id')
      .where({ id: existingTrack.track_id })
      .first()
      .then(alreadyTrack => {
        if (!alreadyTrack) {
          const newTrack = {};
          newTrack.id = existingTrack.track_id;
          newTrack.name = existingTrack.name;
          newTrack.href = existingTrack.href;
          newTrack.external_urls = { spotify: existingTrack.external_url };
          newTrack.track_number = existingTrack.track_number;
          newTrack.preview_url = existingTrack.preview_url;
          newTrack.uri = existingTrack.uri;
          newTrack.explicit = existingTrack.explicit;
          newTrack.duration_ms = existingTrack.duration;
          newTrack.external_ids = { isrc: existingTrack.isrc };
          newTrack.album = { artists: existingTrack.artists, images: [existingTrack.artwork] };
          newTrack.artists = existingTrack.artists;
          fastify
            .writeDb('spotify_tracks')
            .insert(newTrack, ['id'])
            .then(insertResults => {
              if (insertResults) {
                console.log('UPdated tracks table with value', insertResults);
              }
            });
        }
      });
  }
};
