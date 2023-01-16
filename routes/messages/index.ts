import logger from '../../logger';
import { messageSchema, messagesSchema } from '../../models/messages';
import { getAllUserFriendIds } from '../../utils/friends';
import { MAX_BIGINT, safeBigIntToNumber } from '../../utils/numbers';
import { withValidation } from '../../utils/validation';
import { WishrollFastifyInstance } from '../index';
import {
  NewSongsQuery,
  receivedMessagesIndex as receivedMessagesIndexV2,
  ReceivedMessagesQuery as ReceivedMessagesQueryV2,
  receivedNewMessagesIndex,
  sentTracksIndex as sentTracksIndexV2,
  RatedMessagesQuery,
  ratedMessagesSchema,
  SentTracksParams as SentTracksParamsV2,
  SentTracksQuery as SentTracksQueryV2,
} from './schema/v2';
import {
  receivedMessagesIndex,
  sentTracksIndex,
  sentMessagesIndex,
  MessagesIndexQuery,
  SentTracksParams,
  SentTracksQuery,
  ReceivedMessagesQuery,
} from './schema/v1/index';
import { show, ShowParams } from './schema/v1/show';
import create, { CreateBody } from './schema/v1/create';
import { sendNotificationOnReceivedSong } from '../../services/notifications/notifications';
import {
  messagesSentSchemaV1,
  messagesWithRatingSchema,
  tracksSentSchemaV2,
} from '../../models/mergedSchemas';
import { userSchema, usersSchema } from '../../models/users';
import { tracksSchema } from '../../models/tracks';
import { ratingsSchema } from '../../models/ratings';

export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{
    Querystring: ReceivedMessagesQuery;
  }>(
    '/v1/me/messages',
    { onRequest: [fastify.authenticate], schema: receivedMessagesIndex },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const limit = req.query.limit;
      const offset = req.query.offset;

      try {
        const messages = withValidation(
          await fastify
            .readDb('messages')
            .where('messages.recipient_id', currentUserId)
            .offset(offset)
            .limit(limit)
            .orderBy('messages.created_at', 'desc'),
          messagesSchema,
        );
        if (messages.length < 1) {
          return res.status(200).send([]);
        }
        const trackIds = messages.map(m => m.track_id);
        const messageIds = messages.map(m => safeBigIntToNumber(m.id));
        const userIds = messages.map(m => safeBigIntToNumber(m.sender_id));

        const tracks = withValidation(
          await fastify.readDb('tracks').select().whereIn('track_id', trackIds),
          tracksSchema,
        );
        const ratings = withValidation(
          await fastify.readDb('ratings').select().whereIn('message_id', messageIds),
          ratingsSchema,
        );
        const users = withValidation(
          await fastify.readDb('users').select().whereIn('id', userIds),
          usersSchema,
        );

        const data = messages.map(message => {
          const rating = ratings.find(v => v.message_id === message.id);
          return {
            ...message,
            track: tracks.find(v => v.track_id === message.track_id),
            rating,
            is_rated: rating !== undefined,
            sender: users.find(v => v.id === message.sender_id),
          };
        });

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Querystring: ReceivedMessagesQueryV2 }>(
    '/v2/me/messages',
    { onRequest: [fastify.authenticate], schema: receivedMessagesIndexV2 },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const limit = req.query.limit;
      const lastId = req.query.lastId ?? MAX_BIGINT;
      const fromSender = req.query.from;

      try {
        const messagesQuery = fastify
          .readDb('messages')
          .where('messages.recipient_id', currentUserId);

        if (fromSender) {
          messagesQuery.andWhere('messages.sender_id', fromSender);
          logger(req).debug({ from: fromSender }, 'Fetching messages from specific sender');
        }

        messagesQuery
          //@ts-ignore
          .andWhere('messages.id', '<', lastId)
          .orderBy('messages.id', 'desc')
          .limit(limit);

        const messages = withValidation(await messagesQuery, messagesSchema);

        if (messages.length < 1) {
          return res.status(200).send([]);
        }

        let trackIds: string[] = [];
        let messageIds: number[] = [];
        let userIds: number[] = [];

        logger(req).debug(messages, 'here');

        messages.forEach(({ track_id, id, sender_id }) => {
          trackIds = [...trackIds, track_id];
          messageIds = [...messageIds, safeBigIntToNumber(id)];
          userIds = [...userIds, safeBigIntToNumber(sender_id)];
        });

        const tracks = withValidation(
          await fastify.readDb('tracks').select().whereIn('track_id', trackIds),
          tracksSchema,
        );
        const ratings = withValidation(
          await fastify.readDb('ratings').select().whereIn('message_id', messageIds),
          ratingsSchema,
        );
        const users = withValidation(
          await fastify.readDb('users').select().whereIn('id', userIds),
          usersSchema,
        );

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

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Querystring: NewSongsQuery }>(
    '/v2/me/messages/new',
    { onRequest: [fastify.authenticate], schema: receivedNewMessagesIndex },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const limit = req.query.limit;
      const lastId = req.query.lastId ?? MAX_BIGINT;

      try {
        const messages = withValidation(
          await fastify
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
            //@ts-ignore
            .andWhere('messages.id', '<', lastId)
            .orderBy('messages.id', 'desc')
            .leftOuterJoin('ratings', 'ratings.message_id', '=', 'messages.id')
            .limit(limit),
          messagesWithRatingSchema,
        );

        if (messages.length < 1) {
          return res.status(200).send([]);
        }

        const formatedPayload = messages.reduce<{ trackIds: string[]; userIds: number[] }>(
          (prev, curr) => {
            return {
              trackIds: [...prev.trackIds, curr.track_id],
              userIds: [...prev.userIds, safeBigIntToNumber(curr.sender_id)],
            };
          },
          { trackIds: [], userIds: [] },
        );

        const tracks = withValidation(
          await fastify.readDb('tracks').select().whereIn('track_id', formatedPayload.trackIds),
          tracksSchema,
        );
        const users = withValidation(
          await fastify.readDb('users').select().whereIn('id', formatedPayload.userIds),
          usersSchema,
        );

        const data = messages.map(message => {
          return {
            ...message,
            track: tracks.find(track => track.track_id === message.track_id),
            sender: users.find(user => user.id === message.sender_id),
          };
        });

        res.status(200).send(data);
      } catch (error) {
        if (error instanceof Error) {
          logger(req).error(error, 'An error occured during fetching messages without score');
        }
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Querystring: RatedMessagesQuery }>(
    '/v2/me/messages/rated',
    { onRequest: [fastify.authenticate], schema: ratedMessagesSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const limit = req.query.limit;
      const lastId = req.query.lastId ?? MAX_BIGINT;
      const liked = req.query.liked;

      try {
        const messages = withValidation(
          await fastify
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
            .whereNotNull('ratings.id')
            .andWhere('ratings.like', liked)
            .andWhere('messages.recipient_id', currentUserId)
            //@ts-ignore
            .andWhere('messages.id', '<', lastId)
            .orderBy('messages.id', 'desc')
            .innerJoin('ratings', 'ratings.message_id', '=', 'messages.id')
            .limit(limit),
          messagesWithRatingSchema,
        );

        if (messages.length < 1) {
          return res.status(200).send([]);
        }
        const formatedPayload = messages.reduce<{ trackIds: string[]; userIds: number[] }>(
          (prev, curr) => {
            return {
              trackIds: [...prev.trackIds, curr.track_id],
              userIds: [...prev.userIds, safeBigIntToNumber(curr.sender_id)],
            };
          },
          { trackIds: [], userIds: [] },
        );

        const tracks = withValidation(
          await fastify.readDb('tracks').select().whereIn('track_id', formatedPayload.trackIds),
          tracksSchema,
        );
        const users = withValidation(
          await fastify.readDb('users').select().whereIn('id', formatedPayload.userIds),
          usersSchema,
        );

        const data = messages.map(message => {
          return {
            ...message,
            track: tracks.find(track => track.track_id === message.track_id),
            sender: users.find(user => user.id === message.sender_id),
            rating: {
              ...message,
            },
          };
        });

        res.status(200).send(data);
      } catch (error) {
        if (error instanceof Error) {
          logger(req).error(error, 'An error occured during fetching messages without score');
        }
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Querystring: MessagesIndexQuery }>(
    '/v1/me/messages/sent',
    { onRequest: [fastify.authenticate], schema: sentMessagesIndex },
    async (req, res) => {
      const limit = req.query.limit;
      const offset = req.query.offset;

      //@ts-ignore
      const currentUserId = req.user.id;

      try {
        const messages = withValidation(
          await fastify
            .readDb('messages')
            .where('messages.sender_id', currentUserId)
            .offset(offset)
            .limit(limit)
            .orderBy('messages.created_at', 'desc'),
          messagesSchema,
        );
        if (messages.length < 1) {
          return res.status(200).send([]);
        }
        const trackIds = messages.map(m => m.track_id);
        const messageIds = messages.map(m => safeBigIntToNumber(m.id));
        const recipientIds = messages.map(m => safeBigIntToNumber(m.recipient_id));
        const currentUser = withValidation(
          await fastify.readDb('users').select().where({ id: currentUserId }).first(),
          userSchema,
        );

        const tracks = withValidation(
          await fastify.readDb('tracks').select().whereIn('track_id', trackIds),
          tracksSchema,
        );
        const ratings = withValidation(
          await fastify.readDb('ratings').select().whereIn('message_id', messageIds),
          ratingsSchema,
        );
        const recipientUsers = withValidation(
          await fastify.readDb('users').select().whereIn('id', recipientIds),
          usersSchema,
        );
        const data = messages.map(message => {
          const rating = ratings.find(v => v.message_id === message.id);
          return {
            ...message,
            track: tracks.find(v => v.track_id === message.track_id),
            rating,
            is_rated: rating !== undefined,
            sender: currentUser,
            recipient: recipientUsers.find(v => v.id === message.recipient_id),
          };
        });
        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Querystring: SentTracksQuery; Params: SentTracksParams }>(
    '/v1/users/:id/messages/sent',
    { onRequest: [fastify.authenticate], schema: sentTracksIndex },
    async (req, res) => {
      const limit = req.query.limit;
      const offset = req.query.offset;
      const userId = req.params.id;

      try {
        const tracks = withValidation(
          await fastify.readDb
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
            .offset(offset),
          messagesSentSchemaV1,
        );
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

  fastify.get<{
    Querystring: SentTracksQueryV2;
    Params: SentTracksParamsV2;
  }>(
    '/v2/users/:id/tracks/sent',
    { onRequest: [fastify.authenticate], schema: sentTracksIndexV2 },
    async (req, res) => {
      const limit = req.query.limit;
      const lastId = req.query.lastId ?? MAX_BIGINT;
      const userId = req.params.id;

      try {
        const tracks = withValidation(
          await fastify.readDb
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
            //@ts-ignore
            .where('tracks.message_id', '<', lastId)
            .orderBy('tracks.message_created_at', 'desc')
            .limit(limit),
          tracksSentSchemaV2,
        );

        const data = tracks.map(track => {
          return { id: track.message_id, track };
        });

        res.status(200).send(data);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.get<{ Params: ShowParams }>(
    '/v1/messages/:id',
    { onRequest: [fastify.authenticate], schema: show },
    async (req, res) => {
      //@ts-ignore
      const currentUserId = req.user.id;
      const messageId = req.params.id;

      try {
        const message = withValidation(
          await fastify.readDb('messages').where({ id: messageId }).first(),
          messageSchema,
        );

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
          fastify
            .readDb('ratings')
            .where({ message_id: safeBigIntToNumber(message.id) })
            .first(),
          fastify
            .readDb('users')
            .where({ id: safeBigIntToNumber(message.sender_id) })
            .first(),
          fastify
            .readDb('users')
            .where({ id: safeBigIntToNumber(message.recipient_id) })
            .first(),
        ]);

        logger(req).trace({ track, rating, sender, recipient }, 'test');

        let resMessage = {
          recipient: undefined,
          ...message,
          track,
          rating,
          is_rated: rating !== undefined,
          sender,
        };

        if (currentUserId != safeBigIntToNumber(message.recipient_id)) {
          //return recipient if the current user isn't equal to the
          resMessage = {
            ...resMessage,
            recipient,
          };
        }

        res.status(200).send(resMessage);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    },
  );

  fastify.post<{ Body: CreateBody }>(
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

  // TODO: change any
  async function insertIntoSpotifyTracks(existingTrack: any) {
    await fastify
      .readDb('spotify_tracks')
      .select('id')
      .where({ id: existingTrack.track_id })
      .first()
      .then(alreadyTrack => {
        if (!alreadyTrack) {
          const newTrack = {
            id: existingTrack.track_id,
            name: existingTrack.name,
            href: existingTrack.href,
            external_urls: { spotify: existingTrack.external_url },
            track_number: existingTrack.track_number,
            preview_url: existingTrack.preview_url,
            uri: existingTrack.uri,
            explicit: existingTrack.explicit,
            duration_ms: existingTrack.duration,
            external_ids: { isrc: existingTrack.isrc },
            album: { artists: existingTrack.artists, images: [existingTrack.artwork] },
            artists: existingTrack.artists,
          };

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
