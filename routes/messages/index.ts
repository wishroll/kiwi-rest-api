// @ts-nocheck
// TODO: Create interfaces for every schema and remove nocheck

import { FastifyReply, FastifyRequest } from 'fastify';
import logger from '../../logger';
import { getAllUserFriendIds } from '../../utils/friends';
import { MAX_BIGINT } from '../../utils/numbers';
import { WishrollFastifyInstance } from '../index';
import {
  NewSongsQuery,
  receivedMessagesIndex as receivedMessagesIndexV2,
  ReceivedMessagesQuery,
  receivedNewMessagesIndex,
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

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Querystring: ReceivedMessagesQuery }>(
    '/v2/me/messages',
    { onRequest: [fastify.authenticate], schema: receivedMessagesIndexV2 },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const limit = req.query.limit;
      const lastId = req.query.lastId ?? MAX_BIGINT;
      const fromSender = req.query.from;
      const likedOnly = req.query.likedOnly;

      try {
        const messagesQuery = fastify.readDb('messages');

        if (fromSender) {
          messagesQuery.where('messages.sender_id', fromSender);
          logger(req).debug({ from: fromSender }, 'Fetching messages from specific sender');
        }

        messagesQuery
          .where('messages.recipient_id', currentUserId)
          .andWhere('messages.id', '<', lastId)
          .orderBy('messages.id', 'desc')
          .limit(limit);

        const messages = await messagesQuery;

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

        let data = [];

        messages.forEach(message => {
          const rating = ratings.find(rating => rating.message_id === message.id);
          const isMessageRated = rating !== undefined;

          if (likedOnly && (!isMessageRated || !rating.like)) {
            return;
          }

          data = [
            ...data,
            {
              ...message,
              track: tracks.find(track => track.track_id === message.track_id),
              rating,
              is_rated: isMessageRated,
              sender: users.find(user => user.id === message.sender_id),
            },
          ];
        });

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Querystring: NewSongsQuery }>(
    '/v2/me/messages/new',
    { onRequest: [fastify.authenticate], schema: receivedNewMessagesIndex },
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

      try {
        const messages = await fastify
          .readDb('messages')
          .select([
            'messages.id as id',
            'messages.uuid as uuid',
            'messages.created_at as created_at',
            'messages.updated_at as updated_at',
            'messages.text as text',
            'messages.last_sender_id as last_sender_id',
            'messages.sender_id as sender_id',
            'messages.seen as seen',
            'messages.track_id as track_id',
            'messages.recipient_id as recipient_id',
            'ratings.id as ratings_id',
            'ratings.like as like',
            'ratings.score as score',
          ])
          .whereNull('ratings.id')
          .where('messages.recipient_id', currentUserId)
          .andWhere('messages.id', '<', lastId)
          .orderBy('messages.id', 'desc')
          .leftOuterJoin('ratings', 'ratings.message_id', '=', 'messages.id')
          .limit(limit);

        if (messages.length < 1) {
          return res.status(200).send([]);
        }

        const formatedPayload = messages.reduce(
          (prev, curr) => {
            return {
              trackIds: [...prev.trackIds, curr.track_id],
              userIds: [...prev.userIds, curr.sender_id],
            };
          },
          { trackIds: [], userIds: [] },
        );

        const [tracks, users] = await Promise.all([
          fastify.readDb('tracks').select().whereIn('track_id', formatedPayload.trackIds),
          fastify.readDb('users').select().whereIn('id', formatedPayload.userIds),
        ]);

        const data = messages.map(message => {
          return {
            ...message,
            track: tracks.find(track => track.track_id === message.track_id),
            sender: users.find(user => user.id === message.sender_id),
          };
        });

        res.status(200).send(data);
      } catch (error) {
        logger(req).error(error, 'An error occured during fetching messages without score');
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
                'messages.last_sender_id as last_sender_id',
                'messages.seen as seen',
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
          logger(req).debug({ messageCreatedAt: track.message_created_at });
          return { track };
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
                'messages.created_at as message_created_at',
                'messages.id as message_id',
              ])
              .innerJoin('messages', 'tracks.track_id', '=', 'messages.track_id')
              .where('messages.sender_id', userId)
              .distinctOn('isrc')
              .as('tracks'),
          )
          .where('tracks.message_id', '<', lastId)
          .orderBy('tracks.message_created_at', 'desc')
          .limit(limit);

        const data = tracks.map(track => {
          return { id: track.message_id, track };
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

      try {
        const message = await fastify.readDb('messages').where({ id: messageId }).first();

        if (!message) {
          res.status(404).send({ error: true, message: 'Not found' });
          return;
        }
        if (message.sender_id != currentUserId && message.recipient_id != currentUserId) {
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
        if (currentUserId != message.recipient_id) message.recipient = recipient; //return recipient if the current user isn't equal to the

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
        let existingTrack = await fastify
          .readDb('tracks')
          .select()
          .where({ track_id: track.track_id, platform: track.platform })
          .first();
        if (existingTrack) {
          // Update existing tracks with preview_url if user will reuse track
          if (!existingTrack.preview_url && track.preview_url) {
            existingTrack = await fastify
              .writeDb('tracks')
              .select()
              .where({ uuid: existingTrack.uuid })
              .update({ preview_url: track.preview_url }, ['*'])
              .then(rows => rows[0]);
            logger(req).debug(existingTrack, 'updated track with preview_url');
          }

          await insertIntoSpotifyTracks(existingTrack);
          trackId = existingTrack.track_id;
        } else {
          const results = await fastify.writeDb('tracks').insert(track, ['*']);
          if (!results || results.length < 1) {
            return res.status(500).send({ error: true, message: 'Could not create a new track' });
          } else {
            trackId = results[0].track_id;
            await insertIntoSpotifyTracks(results[0]);
          }
        }
        const insertData = await Promise.all(
          recipients.map(async recipient => {
            const id = recipient.id;
            return {
              sender_id: currentUserId,
              recipient_id: id,
              track_id: trackId,
              text,
              seen: false,
              last_sender_id: currentUserId,
            };
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

  async function insertIntoSpotifyTracks(existingTrack) {
    await fastify
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
          return fastify
            .writeDb('spotify_tracks')
            .insert(newTrack, ['id'])
            .then(insertResults => {
              if (insertResults) {
                logger(null).debug({ insertResults }, 'Updated tracks table with value');
              }
            });
        }
      });
  }
};
