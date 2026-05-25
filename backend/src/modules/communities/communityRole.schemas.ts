import { z } from "zod";
import { ALL_COMMUNITY_PERMISSIONS } from "../../constants/communityPermissionKeys";

const permissionRecordSchema = z.record(z.string(), z.boolean()).optional();

export const createRoleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  iconUrl: z.string().url().nullable().optional(),
  permissions: permissionRecordSchema,
  position: z.number().int().min(0).max(999).optional(),
  hoist: z.boolean().optional(),
  mentionable: z.boolean().optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

export const reorderRolesSchema = z.object({
  roleIds: z.array(z.string().min(1)).min(1),
});

export const channelPermissionOverrideSchema = z.object({
  targetType: z.enum(["ROLE", "MEMBER"]),
  targetId: z.string().min(1),
  allow: permissionRecordSchema,
  deny: permissionRecordSchema,
});

export const updateChannelPermissionsSchema = z.object({
  overrides: z.array(channelPermissionOverrideSchema),
});

export const permissionKeySchema = z.enum(
  ALL_COMMUNITY_PERMISSIONS as unknown as [string, ...string[]],
);
