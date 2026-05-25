import type { z } from "zod";
import {
  createRoleSchema,
  reorderRolesSchema,
  updateChannelPermissionsSchema,
  updateRoleSchema,
} from "./communityRole.schemas";

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type ReorderRolesInput = z.infer<typeof reorderRolesSchema>;
export type UpdateChannelPermissionsInput = z.infer<typeof updateChannelPermissionsSchema>;
