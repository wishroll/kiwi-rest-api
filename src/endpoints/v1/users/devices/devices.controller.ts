import { FastifyPluginAsync } from 'fastify';
import { FastifyInstance } from 'fastify/types/instance';
import { createDeviceHandler } from './devices.handler';
import { CreateDeviceBody } from './devices.schema';

const devices: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post<{
    Body: CreateDeviceBody;
  }>('/v1/devices', { onRequest: [fastify.authenticate] }, createDeviceHandler);
};
export default devices;
