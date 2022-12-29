import * as zod from 'zod';

export const messageSchema = zod.object({
  id: zod.coerce.number(),
  uuid: zod.string().uuid(),
  sender_id: zod.coerce.number(),
  recipient_id: zod.coerce.number(),
  track_id: zod.string(),
  created_at: zod.date(),
  updated_at: zod.date(),
  text: zod.string().optional().nullable(),
  seen: zod.coerce.boolean().optional().nullable(),
  last_sender_id: zod.coerce.number().optional().nullable(),
});

export const messagesSchema = zod.array(messageSchema);

export type Message = zod.TypeOf<typeof messageSchema>;
export type Messages = zod.TypeOf<typeof messagesSchema>;
