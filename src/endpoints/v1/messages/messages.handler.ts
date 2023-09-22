import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateMessageBody } from './messages.schema';

export async function getMessagesHandler(
  this: FastifyInstance,
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id: currentUserId } = req.user;
    const messages = await this.prisma.message.findMany({
      where: { sender_id: currentUserId },
    });
    return res.send(messages);
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function createMessageHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: CreateMessageBody }>,
  res: FastifyReply,
) {
  try {
    const { id: currentUserId } = req.user;
    const { track, recipient_ids, text } = req.body;

    const getTrackId: () => Promise<string> = async () => {
      const messageTrack = await this.prisma.track.findFirst({ where: { id: track.id } });
      if (messageTrack) {
        return messageTrack.track_id;
      } else {
        const newTrack = await this.prisma.track.create({ data: track });
        return newTrack.track_id;
      }
    };

    await Promise.all(
      recipient_ids.map(async id => {
        return await this.prisma.message.create({
          data: { recipient_id: id, text, track_id: await getTrackId(), sender_id: currentUserId },
        });
      }),
    );

    return res.status(201).send();
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}
