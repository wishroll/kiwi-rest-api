import * as zod from 'zod';
import { messageSchema } from './messages';
import { ratingSchema } from './ratings';
import { trackSchema } from './tracks';

export const messageWithRatingSchema = ratingSchema
  .pick({
    like: true,
    score: true,
  })
  .merge(messageSchema)
  .extend({
    ratings_id: zod.coerce.bigint().nullable().optional(),
  });

export const messagesWithRatingSchema = zod.array(messageWithRatingSchema);

export const messageSentSchemaV1 = messageSchema
  .pick({
    recipient_id: true,
    last_sender_id: true,
    seen: true,
  })
  .merge(trackSchema)
  .extend({
    message_id: zod.coerce.bigint(),
    message_created_at: zod.date(),
    message_updated_at: zod.date(),
    message_text: zod.string().optional().nullable(),
    message_track_id: zod.string(),
  });

export const messagesSentSchemaV1 = zod.array(messageSentSchemaV1);

export const trackSentSchemaV2 = trackSchema.extend({
  message_id: zod.coerce.bigint(),
  message_created_at: zod.date(),
});

export const tracksSentSchemaV2 = zod.array(trackSentSchemaV2);

export type MessageWithRating = zod.TypeOf<typeof messageWithRatingSchema>;
export type MessagesWithRating = zod.TypeOf<typeof messagesWithRatingSchema>;

export type TrackWithMessageSchemaV1 = zod.TypeOf<typeof messageSentSchemaV1>;
export type TracksWithMessageSchemaV1 = zod.TypeOf<typeof messagesSentSchemaV1>;

export type TrackSentSchemaV2 = zod.TypeOf<typeof trackSentSchemaV2>;
export type TracksSentSchemaV2 = zod.TypeOf<typeof tracksSentSchemaV2>;
