import { buildJsonSchemas } from 'fastify-zod';
import * as zod from 'zod';
import { DeviceType } from '@ding-live/sdk';

export const registerUserSchema = zod.object({
  phone_number: zod.string(),
});

export const authenticatePhoneNumberSchema = zod.object({
  phone_number: zod.string(),
  device_type: zod.custom<DeviceType>(),
  device_id: zod.string(),
});

export const checkOTPCodeSchema = zod.object({
  uuid: zod.string(),
  code: zod.string(),
});

export const retryOTPSchema = zod.object({
  uuid: zod.string(),
});

export const signInUserSchema = zod.object({
  phone_number: zod.string(),
});

export const validateUserPhonenumberSchema = zod.object({
  phone_number: zod.string(),
});

export type RegisterUser = zod.TypeOf<typeof registerUserSchema>;
export type CheckOTPCode = zod.TypeOf<typeof checkOTPCodeSchema>;
export type SignInUserSchema = zod.TypeOf<typeof signInUserSchema>;
export type AuthenticatePhoneNumber = zod.TypeOf<typeof authenticatePhoneNumberSchema>;
export type RetryOTP = zod.TypeOf<typeof retryOTPSchema>;
export type ValidateUserPhonenumber = zod.TypeOf<typeof validateUserPhonenumberSchema>; 

export const { schemas: authSchemas, $ref } = buildJsonSchemas(
  {
    registerUserSchema,
    signInUserSchema,
    authenticatePhoneNumberSchema,
    checkOTPCodeSchema,
    retryOTPSchema,
    validateUserPhonenumberSchema
  },
  { $id: 'AuthSchemas' },
);
