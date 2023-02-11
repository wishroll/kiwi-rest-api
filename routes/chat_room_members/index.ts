import { WishrollFastifyInstance } from '../index';
import {
  IndexChatRoomMembersParams,
  IndexChatRoomMembersQueryString,
  indexChatRoomMembersSchema,
} from './schema/v1';
import {
  CreateChatRoomMembersBody,
  CreateChatRoomMembersParams,
  createChatRoomMembersSchema,
} from './schema/v1/create';
import { DeleteChatRoomMemberParams, deleteChatRoomMemberSchema } from './schema/v1/delete';
export default async (fastify: WishrollFastifyInstance) => {
  fastify.get<{ Params: IndexChatRoomMembersParams; QueryString: IndexChatRoomMembersQueryString }>(
    '/v1/chat_rooms/:id/chat_room_members',
    { onRequest: [fastify.authenticate], schema: indexChatRoomMembersSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const chatRoomId = req.params.id;
    },
  );

  fastify.post<{ Params: CreateChatRoomMembersParams; Body: CreateChatRoomMembersBody }>(
    '/v1/chat_rooms/:id/chat_room_members',
    { onRequest: [fastify.authenticate], schema: createChatRoomMembersSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;

      const chatRoomId = req.params.id;
    },
  );

  fastify.delete<{ Params: DeleteChatRoomMemberParams }>(
    '/v1/chat_room_members/:id',
    { onRequest: [fastify.authenticate], schema: deleteChatRoomMemberSchema },
    async (req, res) => {
      // @ts-ignore
      const currentUserId = req.user.id;
      const chatRoomMemberId = req.params.id;
    },
  );
};
