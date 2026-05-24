import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  createChannelSchema,
  createCommunityInviteSchema,
  createCommunitySchema,
  listCommunitiesQuerySchema,
  updateChannelSchema,
  updateCommunitySchema,
  updateMemberSchema,
} from "./community.schemas";
import * as communityService from "./community.service";
import { z } from "zod";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function handleValidationError(error: ZodError, res: Response) {
  const message = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message });
}

export async function listCommunities(req: Request, res: Response) {
  try {
    const query = listCommunitiesQuerySchema.parse(req.query);
    const { userId } = req as AuthenticatedRequest;
    const result = await communityService.listCommunities(query, userId);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function createCommunity(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = createCommunitySchema.parse(req.body);
    const result = await communityService.createCommunity(userId, input);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function getCommunityById(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.getCommunityById(param(req.params.communityId), userId);
  res.json(result);
}

export async function updateCommunity(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updateCommunitySchema.parse(req.body);
    const result = await communityService.updateCommunity(
      param(req.params.communityId),
      userId,
      input,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function deleteCommunity(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.deleteCommunity(param(req.params.communityId), userId);
  res.json(result);
}

export async function joinCommunity(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.joinCommunity(param(req.params.communityId), userId);
  res.json(result);
}

export async function leaveCommunity(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.leaveCommunity(param(req.params.communityId), userId);
  res.json(result);
}

export async function listCommunityMembers(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.listCommunityMembers(param(req.params.communityId), userId);
  res.json(result);
}

export async function updateCommunityMember(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updateMemberSchema.parse(req.body);
    const result = await communityService.updateCommunityMember(
      param(req.params.communityId),
      userId,
      param(req.params.memberId),
      input,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function removeCommunityMember(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.removeCommunityMember(
    param(req.params.communityId),
    userId,
    param(req.params.memberId),
  );
  res.json(result);
}

export async function listCommunityChannels(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.listCommunityChannels(param(req.params.communityId), userId);
  res.json(result);
}

export async function createCommunityChannel(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = createChannelSchema.parse(req.body);
    const result = await communityService.createCommunityChannel(
      param(req.params.communityId),
      userId,
      input,
    );
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function getCommunityChannelById(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.getCommunityChannelById(
    param(req.params.communityId),
    param(req.params.channelId),
    userId,
  );
  res.json(result);
}

export async function updateCommunityChannel(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updateChannelSchema.parse(req.body);
    const result = await communityService.updateCommunityChannel(
      param(req.params.communityId),
      param(req.params.channelId),
      userId,
      input,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function deleteCommunityChannel(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.deleteCommunityChannel(
    param(req.params.communityId),
    param(req.params.channelId),
    userId,
  );
  res.json(result);
}

export async function createCommunityInvite(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = createCommunityInviteSchema.parse(req.body);
    const result = await communityService.createCommunityInvite(
      param(req.params.communityId),
      userId,
      input,
    );
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function listCommunityInvites(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.listCommunityInvites(param(req.params.communityId), userId);
  res.json(result);
}

export async function revokeCommunityInvite(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityService.revokeCommunityInvite(
    param(req.params.communityId),
    param(req.params.inviteId),
    userId,
  );
  res.json(result);
}

export async function getCommunityInvitePreview(req: Request, res: Response) {
  const result = await communityService.getCommunityInvitePreview(param(req.params.code));
  res.json(result);
}

const acceptCommunityInviteSchema = z.object({}).optional();

export async function acceptCommunityInvite(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  acceptCommunityInviteSchema.parse(req.body ?? {});
  const result = await communityService.acceptCommunityInvite(param(req.params.code), userId);
  res.json(result);
}
