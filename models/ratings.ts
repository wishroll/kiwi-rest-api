import * as zod from 'zod';

export const ratingSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  score: zod.coerce.number(),
  user_id: zod.coerce.number(),
  message_id: zod.coerce.number(),
  like: zod.coerce.boolean().optional().nullable(),
});

export const ratingsSchema = zod.array(ratingSchema);

export type Rating = zod.TypeOf<typeof ratingSchema>;
export type Ratings = zod.TypeOf<typeof ratingsSchema>;
