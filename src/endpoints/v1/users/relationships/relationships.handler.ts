import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateRelationshipRequestBody,
  DeleteRelationshipBody,
  GetUserRelationshipQuery,
  CreateRelationshipBody,
  DeleteRelationshipRequestBody,
  GetRelationshipStatusQuerystring,
  GetSuggestedRelationshipUsersQuerystring,
  GetRequestedRelationshipUserQuerystring,
  GetRequestingRelationshipUserQuerystring,
} from './relationships.schema';
import {
  getRelationships,
  deleteRelationship,
  deleteRelationshipRequest,
  createRelationship,
  createRelationshipRequest,
  getRelationshipsRequested,
  getRelationshipsRequesting,
  getSuggestedRelationships,
} from './util/neo4js';
import { User } from 'src/models/users';

export async function createRelationshipHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: CreateRelationshipBody }>,
  res: FastifyReply,
) {
  try {
    const { id: currentUserId } = req.user;
    const { friend_id: friendId } = req.body;
    await createRelationship(currentUserId, friendId, Date.now().toString(), Date.now().toString());
    return res.status(201).send();
  } catch (error) {}
}

export async function deleteRelationshipHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: DeleteRelationshipBody }>,
  res: FastifyReply,
) {
  try {
    const { friend_id: friendId } = req.body;
    const { id: currentUserId } = req.user;
    await deleteRelationship(currentUserId, friendId);
    return res.status(200).send();
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function getRelationshipsHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Querystring: GetUserRelationshipQuery }>,
  res: FastifyReply,
) {
  try {
    const { id: currentUserId } = req.user;
    const { limit, offset } = req.query;
    const friends: User[] = await getRelationships(currentUserId, limit, offset);
    if (friends.length > 0) {
      return res.status(200).send(friends);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function createRelationshipRequestHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: CreateRelationshipRequestBody }>,
  res: FastifyReply,
) {
  try {
    const { id: requestingUserId } = req.user;
    const { requested_user_id: requestedUserId } = req.body;
    await createRelationshipRequest(
      requestingUserId,
      requestedUserId,
      Date.now().toString(),
      Date.now().toString(),
    );
    return res.status(200).send();
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function deleteRelationshipRequestHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Body: DeleteRelationshipRequestBody }>,
  res: FastifyReply,
) {
  try {
    const { id: currentUserId } = req.user;
    const { requested_user_id: requestedUserId } = req.body;
    await deleteRelationshipRequest(currentUserId, requestedUserId);
    return res.status(200).send();
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function getRequestedRelationshipsHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Querystring: GetRequestedRelationshipUserQuerystring }>,
  res: FastifyReply,
) {
  try {
    const { id: currentUserId } = req.user;
    const { limit, offset } = req.query;
    const relationshipRequestedUsers: User[] = await getRelationshipsRequested(
      currentUserId,
      limit,
      offset,
    );
    if (relationshipRequestedUsers.length > 0) {
      return res.status(200).send(relationshipRequestedUsers);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function getRequestingRelationshipsHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Querystring: GetRequestingRelationshipUserQuerystring }>,
  res: FastifyReply,
) {
  try {
    const { id: currentUserId } = req.user;
    const { limit, offset } = req.query;
    const relationshipRequestingUsers: User[] = await getRelationshipsRequesting(
      currentUserId,
      limit,
      offset,
    );
    if (relationshipRequestingUsers.length > 0) {
      return res.status(200).send(relationshipRequestingUsers);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function getRelationshipStatusHandler(
  this: FastifyInstance,
  req: FastifyRequest<{ Querystring: GetRelationshipStatusQuerystring }>,
  res: FastifyReply,
) {
  try {
    // const { id: currentUserId } = req.user;
    // const { user_id: userId } = req.query;
    return res.status(200).send();
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}

export async function getRelationshipSuggestions(
  this: FastifyInstance,
  req: FastifyRequest<{ Querystring: GetSuggestedRelationshipUsersQuerystring }>,
  res: FastifyReply,
) {
  try {
    const { id: currentUserId } = req.user;
    const { limit, offset } = req.query;
    const suggestedRelationshipUsers: User[] = await getSuggestedRelationships(
      currentUserId,
      limit,
      offset,
    );
    if (suggestedRelationshipUsers.length > 0) {
      return res.status(200).send(suggestedRelationshipUsers);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    this.errorHandler(error as FastifyError, req, res);
  }
}
