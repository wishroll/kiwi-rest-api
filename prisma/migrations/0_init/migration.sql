-- CreateTable
CREATE TABLE "Answer" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prompt_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "body" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attachable_id" BIGINT NOT NULL,
    "attachable_type" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoomMember" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "chat_room_id" BIGINT NOT NULL,
    "num_unseen_messages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatRoomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoomMessage" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chat_room_id" BIGINT NOT NULL,
    "sender_id" BIGINT NOT NULL,
    "song_message_id" BIGINT,
    "type" TEXT NOT NULL,
    "text" TEXT,

    CONSTRAINT "ChatRoomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "num_users" INTEGER NOT NULL DEFAULT 0,
    "num_messages" INTEGER NOT NULL DEFAULT 0,
    "last_message_id" BIGINT,

    CONSTRAINT "chat_rooms_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationUser" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_room_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "os" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmojiReaction" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "emoji" VARCHAR(255) NOT NULL,
    "emoji_reactionable_id" BIGINT NOT NULL,
    "emoji_reactionable_type" VARCHAR(255) NOT NULL,

    CONSTRAINT "EmojiReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirebaseCloudMessagingToken" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" VARCHAR(255) NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "FirebaseCloudMessagingToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requester_phone_number" VARCHAR(255),
    "requested_phone_number" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requester_user_id" BIGINT,
    "requested_user_id" BIGINT,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" BIGINT NOT NULL,
    "friend_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knex_migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "batch" INTEGER,
    "migration_time" TIMESTAMPTZ(6),

    CONSTRAINT "knex_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knex_migrations_lock" (
    "index" SERIAL NOT NULL,
    "is_locked" INTEGER,

    CONSTRAINT "knex_migrations_lock_pkey" PRIMARY KEY ("index")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sender_id" BIGINT NOT NULL,
    "recipient_id" BIGINT NOT NULL,
    "track_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT,
    "seen" BOOLEAN,
    "last_sender_id" BIGINT,

    CONSTRAINT "sent_spotify_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR(255),
    "subtitle" VARCHAR(255),

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "score" REAL NOT NULL DEFAULT 0,
    "user_id" BIGINT NOT NULL,
    "message_id" BIGINT NOT NULL,
    "like" BOOLEAN,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reply" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" VARCHAR(255) NOT NULL,
    "sender_id" BIGINT NOT NULL,
    "recipient_id" BIGINT NOT NULL,
    "message_id" BIGINT NOT NULL,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyTrack" (
    "album" JSONB,
    "artists" JSONB[],
    "available_markets" TEXT[],
    "disc_number" BIGINT,
    "duration_ms" BIGINT DEFAULT 0,
    "episode" BOOLEAN DEFAULT false,
    "explicit" BOOLEAN DEFAULT false,
    "external_ids" JSONB,
    "external_urls" JSONB,
    "href" VARCHAR(255),
    "is_local" BOOLEAN DEFAULT false,
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "popularity" INTEGER,
    "preview_url" VARCHAR(255),
    "track" BOOLEAN DEFAULT true,
    "track_number" INTEGER,
    "type" VARCHAR(255),
    "uri" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotifyTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "track_id" VARCHAR(255) NOT NULL,
    "external_url" VARCHAR(255) NOT NULL,
    "preview_url" VARCHAR(255),
    "uri" VARCHAR(255),
    "href" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "duration" BIGINT NOT NULL DEFAULT 0,
    "track_number" BIGINT NOT NULL,
    "release_date" VARCHAR(255),
    "isrc" VARCHAR(255),
    "explicit" BOOLEAN DEFAULT false,
    "artwork" JSONB,
    "artists" JSONB[],
    "platform" VARCHAR(255) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRating" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" BIGINT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0.11,
    "num_ratings" BIGINT NOT NULL DEFAULT 0,
    "likes" INTEGER DEFAULT 0,

    CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "display_name" VARCHAR(255),
    "phone_number" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar_url" VARCHAR(255),
    "username" VARCHAR(255),
    "share_link" VARCHAR(255),
    "bio" VARCHAR(255),
    "location" VARCHAR(255),
    "display_name_updated_at" TIMESTAMPTZ(6),
    "username_updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "View" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "viewable_id" BIGINT NOT NULL,
    "viewable_type" VARCHAR(255) NOT NULL,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_answers" ON "Answer"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "index_id_prompt_id_user_id" ON "Answer"("id", "prompt_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_prompt_id_user_id" ON "Answer"("prompt_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_attachments" ON "Attachment"("uuid");

-- CreateIndex
CREATE INDEX "attachments_attachable_id_index" ON "Attachment"("attachable_id");

-- CreateIndex
CREATE INDEX "attachments_attachable_type_index" ON "Attachment"("attachable_type");

-- CreateIndex
CREATE INDEX "attachments_name_index" ON "Attachment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "index_chat_room_members_uuid" ON "ChatRoomMember"("uuid");

-- CreateIndex
CREATE INDEX "chat_room_members_chat_room_id_index" ON "ChatRoomMember"("chat_room_id");

-- CreateIndex
CREATE INDEX "chat_room_members_num_unseen_messages_index" ON "ChatRoomMember"("num_unseen_messages");

-- CreateIndex
CREATE INDEX "chat_room_members_user_id_index" ON "ChatRoomMember"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_chat_room_messages_uuid" ON "ChatRoomMessage"("uuid");

-- CreateIndex
CREATE INDEX "chat_room_messages_chat_room_id_index" ON "ChatRoomMessage"("chat_room_id");

-- CreateIndex
CREATE INDEX "chat_room_messages_sender_id_index" ON "ChatRoomMessage"("sender_id");

-- CreateIndex
CREATE INDEX "chat_room_messages_type_index" ON "ChatRoomMessage"("type");

-- CreateIndex
CREATE UNIQUE INDEX "index_chat_rooms_uuid" ON "ChatRoom"("uuid");

-- CreateIndex
CREATE INDEX "chat_rooms_last_message_id_index" ON "ChatRoom"("last_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_chat_room_users" ON "ConversationUser"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "index_id_chat_room_id_user_id" ON "ConversationUser"("conversation_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_chat_rooms" ON "Conversation"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_devices" ON "Device"("uuid");

-- CreateIndex
CREATE INDEX "index_os_devices" ON "Device"("os");

-- CreateIndex
CREATE INDEX "index_token_devices" ON "Device"("token");

-- CreateIndex
CREATE UNIQUE INDEX "index_user_id_token_id_devices" ON "Device"("user_id", "token");

-- CreateIndex
CREATE UNIQUE INDEX "index_emoji_reactions_uuid" ON "EmojiReaction"("uuid");

-- CreateIndex
CREATE INDEX "emoji_reactions_emoji_index" ON "EmojiReaction"("emoji");

-- CreateIndex
CREATE INDEX "emoji_reactions_emoji_reactionable_id_index" ON "EmojiReaction"("emoji_reactionable_id");

-- CreateIndex
CREATE INDEX "emoji_reactions_emoji_reactionable_type_index" ON "EmojiReaction"("emoji_reactionable_type");

-- CreateIndex
CREATE INDEX "emoji_reactions_user_id_index" ON "EmojiReaction"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_firebase_cloud_messaging_tokens" ON "FirebaseCloudMessagingToken"("uuid");

-- CreateIndex
CREATE INDEX "index_token_firebase_cloud_messaging_tokens" ON "FirebaseCloudMessagingToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "index_user_id_token_firebase_cloud_messaging_tokens" ON "FirebaseCloudMessagingToken"("user_id", "token");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_friend_requests" ON "FriendRequest"("uuid");

-- CreateIndex
CREATE INDEX "friend_requests_requester_phone_number_requested_phone_number_i" ON "FriendRequest"("requester_phone_number", "requested_phone_number");

-- CreateIndex
CREATE INDEX "friend_requests_requester_user_id_requested_user_id_index" ON "FriendRequest"("requester_user_id", "requested_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_requester_phone_number_requested_phone_number" ON "FriendRequest"("requester_phone_number", "requested_phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "index_requester_user_id_requested_user_id" ON "FriendRequest"("requester_user_id", "requested_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_friends" ON "Friend"("uuid");

-- CreateIndex
CREATE INDEX "friends_user_id_friend_id_index" ON "Friend"("user_id", "friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_user_id_friend_id" ON "Friend"("user_id", "friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_sent_spotify_tracks" ON "Message"("uuid");

-- CreateIndex
CREATE INDEX "messages_recipient_id_idx" ON "Message"("recipient_id", "id");

-- CreateIndex
CREATE INDEX "sent_spotify_tracks_recipient_id_index" ON "Message"("recipient_id");

-- CreateIndex
CREATE INDEX "sent_spotify_tracks_sender_id_index" ON "Message"("sender_id");

-- CreateIndex
CREATE INDEX "sent_spotify_tracks_sender_id_recipient_id_index" ON "Message"("sender_id", "recipient_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_prompts" ON "Prompt"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "index_unique_prompt_title" ON "Prompt"("title");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_questions" ON "Question"("uuid");

-- CreateIndex
CREATE INDEX "index_user_id_on_questions" ON "Question"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_ratings" ON "Rating"("uuid");

-- CreateIndex
CREATE INDEX "index_score_ratings" ON "Rating"("score");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_message_id_user_id_unique" ON "Rating"("message_id", "user_id");

-- CreateIndex
CREATE INDEX "Reply_message_id_idx" ON "Reply"("message_id");

-- CreateIndex
CREATE INDEX "update_reply_idx" ON "Reply"("message_id", "recipient_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "spotify_tracks_id_unique" ON "SpotifyTrack"("id");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_tracks" ON "Track"("uuid");

-- CreateIndex
CREATE INDEX "index_name_tracks" ON "Track"("name");

-- CreateIndex
CREATE INDEX "index_platform_tracks" ON "Track"("platform");

-- CreateIndex
CREATE INDEX "index_track_id_tracks" ON "Track"("track_id");

-- CreateIndex
CREATE INDEX "tracks_track_id_index" ON "Track"("track_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_track_id_platform_unique" ON "Track"("track_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_user_ratings" ON "UserRating"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_ratings_user_id_unique" ON "UserRating"("user_id");

-- CreateIndex
CREATE INDEX "user_ratings_num_ratings_index" ON "UserRating"("num_ratings");

-- CreateIndex
CREATE INDEX "user_ratings_score_index" ON "UserRating"("score");

-- CreateIndex
CREATE UNIQUE INDEX "index_uuid_users" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "index_unique_phone_number_users" ON "User"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "index_username_on_users" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "index_id_phone_number_users" ON "User"("id", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "index_views_uuid" ON "View"("uuid");

-- CreateIndex
CREATE INDEX "views_user_id_index" ON "View"("user_id");

-- CreateIndex
CREATE INDEX "views_viewable_id_index" ON "View"("viewable_id");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "answers_prompt_id_foreign" FOREIGN KEY ("prompt_id") REFERENCES "Prompt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "answers_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChatRoomMember" ADD CONSTRAINT "chat_room_members_chat_room_id_foreign" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChatRoomMember" ADD CONSTRAINT "chat_room_members_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChatRoomMessage" ADD CONSTRAINT "chat_room_messages_chat_room_id_foreign" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChatRoomMessage" ADD CONSTRAINT "chat_room_messages_sender_id_foreign" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChatRoomMessage" ADD CONSTRAINT "chat_room_messages_song_message_id_foreign" FOREIGN KEY ("song_message_id") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ConversationUser" ADD CONSTRAINT "chat_room_users_chat_room_id_foreign" FOREIGN KEY ("conversation_id") REFERENCES "Conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ConversationUser" ADD CONSTRAINT "chat_room_users_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "devices_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmojiReaction" ADD CONSTRAINT "emoji_reactions_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FirebaseCloudMessagingToken" ADD CONSTRAINT "firebase_cloud_messaging_tokens_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "friend_requests_requested_user_id_foreign" FOREIGN KEY ("requested_user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "friend_requests_requester_user_id_foreign" FOREIGN KEY ("requester_user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "friends_friend_id_foreign" FOREIGN KEY ("friend_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "friends_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "messages_last_sender_id_foreign" FOREIGN KEY ("last_sender_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "sent_spotify_tracks_recipient_id_foreign" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "sent_spotify_tracks_sender_id_foreign" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "questions_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "ratings_message_id_foreign" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "ratings_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "replies_message_id_foreign" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "replies_recipient_id_foreign" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "replies_sender_id_foreign" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "user_ratings_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "views_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

