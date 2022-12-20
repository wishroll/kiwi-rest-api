import { PLATFORM } from '../utils/platform';
export type Device = {
  id: number;
  token: string;
  platform: PLATFORM;
  created_at: string;
  updated_at: string;
};
