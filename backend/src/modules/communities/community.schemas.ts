import { z } from "zod";
import {
  ChannelType,
  ChannelVisibility,
  CommunityCategory,
  CommunityMemberRole,
  CommunityVisibility,
} from "@prisma/client";

export const listCommunitiesQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.nativeEnum(CommunityCategory).optional(),
  visibility: z.nativeEnum(CommunityVisibility).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
});

export const createCommunitySchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(500).optional(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  visibility: z.nativeEnum(CommunityVisibility).optional(),
  category: z.nativeEnum(CommunityCategory).optional(),
});

export const updateCommunitySchema = createCommunitySchema.partial();

export const channelPermissionSchema = z.object({
  minRoleView: z.nativeEnum(CommunityMemberRole).optional(),
  minRoleSend: z.nativeEnum(CommunityMemberRole).optional(),
  minRoleWatchStart: z.nativeEnum(CommunityMemberRole).optional(),
  minRoleWatchControl: z.nativeEnum(CommunityMemberRole).optional(),
  minRoleVoice: z.nativeEnum(CommunityMemberRole).optional(),
  minRoleVideo: z.nativeEnum(CommunityMemberRole).optional(),
});

export const createChannelSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(240).optional(),
  type: z.nativeEnum(ChannelType),
  visibility: z.nativeEnum(ChannelVisibility).optional(),
  permissions: channelPermissionSchema.optional(),
});

export const updateChannelSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(240).optional().nullable(),
  visibility: z.nativeEnum(ChannelVisibility).optional(),
  position: z.number().int().min(0).optional(),
  permissions: channelPermissionSchema.optional(),
});

export const updateMemberSchema = z.object({
  role: z.nativeEnum(CommunityMemberRole).optional(),
});

export const createCommunityInviteSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  maxUses: z.number().int().min(1).max(1000).optional(),
});

export type ListCommunitiesQuery = z.infer<typeof listCommunitiesQuerySchema>;
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;
export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type CreateCommunityInviteInput = z.infer<typeof createCommunityInviteSchema>;
export type ChannelPermissionInput = z.infer<typeof channelPermissionSchema>;
