import * as zod from 'zod';
import { messageSchema } from './messages';
import { ratingSchema } from './ratings';

export const messageWithRatingSchema = messageSchema.merge(
  ratingSchema
    .pick({
      like: true,
      score: true,
    })
    .extend({
      ratings_id: zod.coerce.number(),
    }),
);

export const messagesWithRatingSchema = zod.array(messageWithRatingSchema);

export type MessageWithRating = zod.TypeOf<typeof messageWithRatingSchema>;
export type MessagesWithRating = zod.TypeOf<typeof messagesWithRatingSchema>;
