import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  createRoleSchema,
  reorderRolesSchema,
  updateChannelPermissionsSchema,
  updateRoleSchema,
} from "./communityRole.schemas";
import * as communityRoleService from "./communityRole.service";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function handleValidationError(error: ZodError, res: Response) {
  const message = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message });
}

export async function listCommunityRoles(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityRoleService.listCommunityRoles(
    param(req.params.communityId),
    userId,
  );
  res.json(result);
}

export async function getCommunityRoleById(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityRoleService.getCommunityRoleById(
    param(req.params.communityId),
    param(req.params.roleId),
    userId,
  );
  res.json(result);
}

export async function createCommunityRole(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = createRoleSchema.parse(req.body);
    const result = await communityRoleService.createCommunityRole(
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

export async function updateCommunityRole(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updateRoleSchema.parse(req.body);
    const result = await communityRoleService.updateCommunityRole(
      param(req.params.communityId),
      param(req.params.roleId),
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

export async function deleteCommunityRole(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityRoleService.deleteCommunityRole(
    param(req.params.communityId),
    param(req.params.roleId),
    userId,
  );
  res.json(result);
}

export async function reorderCommunityRoles(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = reorderRolesSchema.parse(req.body);
    const result = await communityRoleService.reorderCommunityRoles(
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

export async function assignRoleToMember(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityRoleService.assignRoleToMember(
    param(req.params.communityId),
    param(req.params.memberId),
    param(req.params.roleId),
    userId,
  );
  res.status(201).json(result);
}

export async function removeRoleFromMember(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityRoleService.removeRoleFromMember(
    param(req.params.communityId),
    param(req.params.memberId),
    param(req.params.roleId),
    userId,
  );
  res.json(result);
}

export async function listMemberRoles(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityRoleService.listMemberRoles(
    param(req.params.communityId),
    param(req.params.memberId),
    userId,
  );
  res.json(result);
}

export async function getChannelPermissions(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityRoleService.getChannelPermissions(
    param(req.params.communityId),
    param(req.params.channelId),
    userId,
  );
  res.json(result);
}

export async function updateChannelPermissions(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updateChannelPermissionsSchema.parse(req.body);
    const result = await communityRoleService.updateChannelPermissions(
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
