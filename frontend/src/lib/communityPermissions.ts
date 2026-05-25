export const ADMINISTRATOR_PERMISSION = "administrator" as const;

export const PERMISSION_CATEGORIES = {
  server: [
    "server.view",
    "server.edit",
    "server.delete",
    "server.view_members",
    "server.invite_members",
    "server.kick_members",
    "server.ban_members",
    "server.manage_invites",
    "server.manage_roles",
    "server.manage_security",
  ],
  channel: [
    "channel.view",
    "channel.create",
    "channel.edit",
    "channel.delete",
    "channel.reorder",
    "channel.view_private",
  ],
  text: [
    "text.send",
    "text.read",
    "text.delete",
    "text.edit",
    "text.attach_files",
    "text.embed_links",
    "text.use_reactions",
    "text.mention_everyone",
    "text.pin_messages",
    "text.read_history",
  ],
  voice: [
    "voice.join",
    "voice.speak",
    "voice.listen_muted",
    "voice.self_mute",
    "voice.mute_members",
    "voice.deafen_members",
    "voice.disconnect_members",
    "voice.manage",
  ],
  video: [
    "video.join",
    "video.camera",
    "video.screen_share",
    "video.view_screen_share",
    "video.manage",
  ],
  watch: [
    "watch.view",
    "watch.start",
    "watch.queue_add",
    "watch.queue_edit",
    "watch.control",
    "watch.become_host",
    "watch.assisted_external_sync",
    "watch.send_sync_command",
    "watch.start_countdown",
  ],
  moderation: [
    "mod.manage_messages",
    "mod.view_reports",
    "mod.resolve_reports",
    "mod.timeout_members",
    "mod.temp_ban",
    "mod.ban_members",
    "mod.unban_members",
    "mod.view_audit_log",
  ],
  admin: [ADMINISTRATOR_PERMISSION],
} as const;

export type PermissionCategoryKey = keyof typeof PERMISSION_CATEGORIES;

export type CommunityPermissionKey =
  | (typeof PERMISSION_CATEGORIES)[PermissionCategoryKey][number];

export type RolePermissionsMap = Partial<Record<CommunityPermissionKey, boolean>>;

export const CRITICAL_PERMISSIONS = new Set<CommunityPermissionKey>([
  ADMINISTRATOR_PERMISSION,
  "server.delete",
  "server.manage_roles",
  "server.ban_members",
]);

export const PERMISSION_CATEGORY_ORDER: PermissionCategoryKey[] = [
  "server",
  "channel",
  "text",
  "voice",
  "video",
  "watch",
  "moderation",
  "admin",
];

export function mergePermissions(maps: RolePermissionsMap[]): RolePermissionsMap {
  const merged: RolePermissionsMap = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map)) {
      if (value) {
        merged[key as CommunityPermissionKey] = true;
      }
    }
  }
  if (merged[ADMINISTRATOR_PERMISSION]) {
    for (const category of PERMISSION_CATEGORY_ORDER) {
      for (const key of PERMISSION_CATEGORIES[category]) {
        merged[key] = true;
      }
    }
  }
  return merged;
}
