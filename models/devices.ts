import * as zod from 'zod';

export const deviceSchema = zod.object({
  id: zod.coerce.bigint(),
  uuid: zod.string().uuid(),
  os: zod.string(),
  token: zod.string(),
  user_id: zod.coerce.bigint(),
});

export const devicesSchema = zod.array(deviceSchema);

export type Device = zod.TypeOf<typeof deviceSchema>;
export type Devices = zod.TypeOf<typeof devicesSchema>;
