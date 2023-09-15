import * as zod from 'zod';

export const jsonb = zod.record(zod.any());

export const trackSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  track_id: zod.string(),
  external_url: zod.string(),
  preview_url: zod.string().optional().nullable(),
  uri: zod.string().optional().nullable(),
  href: zod.string(),
  name: zod.string(),
  duration: zod.coerce.bigint(),
  track_number: zod.coerce.bigint(),
  release_date: zod.string().optional().nullable(),
  isrc: zod.string().optional().nullable(),
  explicit: zod.coerce.boolean().optional().nullable(),
  artwork: jsonb.optional().nullable(),
  artists: zod.array(jsonb),
  platform: zod.string(),
});

export const tracksSchema = zod.array(trackSchema);

export type Track = zod.TypeOf<typeof trackSchema>;
export type Tracks = zod.TypeOf<typeof tracksSchema>;
