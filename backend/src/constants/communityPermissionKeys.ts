export const ADMINISTRATOR_PERMISSION = "administrator" as const;

export const SERVER_PERMISSIONS = [
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
] as const;

export const CHANNEL_PERMISSIONS = [
  "channel.view",
  "channel.create",
  "channel.edit",
  "channel.delete",
  "channel.reorder",
  "channel.view_private",
] as const;

export const TEXT_PERMISSIONS = [
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
] as const;

export const VOICE_PERMISSIONS = [
  "voice.join",
  "voice.speak",
  "voice.listen_muted",
  "voice.self_mute",
  "voice.mute_members",
  "voice.deafen_members",
  "voice.disconnect_members",
  "voice.manage",
] as const;

export const VIDEO_PERMISSIONS = [
  "video.join",
  "video.camera",
  "video.screen_share",
  "video.view_screen_share",
  "video.manage",
] as const;

export const WATCH_PERMISSIONS = [
  "watch.view",
  "watch.start",
  "watch.queue_add",
  "watch.queue_edit",
  "watch.control",
  "watch.become_host",
  "watch.assisted_external_sync",
  "watch.send_sync_command",
  "watch.start_countdown",
] as const;

export const MODERATION_PERMISSIONS = [
  "mod.manage_messages",
  "mod.view_reports",
  "mod.resolve_reports",
  "mod.timeout_members",
  "mod.temp_ban",
  "mod.ban_members",
  "mod.unban_members",
  "mod.view_audit_log",
] as const;

export const ALL_COMMUNITY_PERMISSIONS = [
  ADMINISTRATOR_PERMISSION,
  ...SERVER_PERMISSIONS,
  ...CHANNEL_PERMISSIONS,
  ...TEXT_PERMISSIONS,
  ...VOICE_PERMISSIONS,
  ...VIDEO_PERMISSIONS,
  ...WATCH_PERMISSIONS,
  ...MODERATION_PERMISSIONS,
] as const;

export type CommunityPermissionKey = (typeof ALL_COMMUNITY_PERMISSIONS)[number];

export type PermissionCategory =
  | "server"
  | "channel"
  | "text"
  | "voice"
  | "video"
  | "watch"
  | "moderation"
  | "admin";

export const PERMISSION_CATEGORIES: Record<
  PermissionCategory,
  readonly CommunityPermissionKey[]
> = {
  server: SERVER_PERMISSIONS,
  channel: CHANNEL_PERMISSIONS,
  text: TEXT_PERMISSIONS,
  voice: VOICE_PERMISSIONS,
  video: VIDEO_PERMISSIONS,
  watch: WATCH_PERMISSIONS,
  moderation: MODERATION_PERMISSIONS,
  admin: [ADMINISTRATOR_PERMISSION],
};

export type RolePermissionsMap = Partial<Record<CommunityPermissionKey, boolean>>;

export type DefaultRoleSystemKey =
  | "OWNER"
  | "ADMIN"
  | "MODERATOR"
  | "MEMBER"
  | "GUEST";

export const DEFAULT_ROLE_DEFINITIONS: Array<{
  systemKey: DefaultRoleSystemKey;
  name: string;
  color: string;
  position: number;
  hoist: boolean;
  mentionable: boolean;
  isDefault: boolean;
  isOwnerRole: boolean;
  permissions: RolePermissionsMap;
}> = [
  {
    systemKey: "OWNER",
    name: "Kurucu",
    color: "#E74C3C",
    position: 100,
    hoist: true,
    mentionable: true,
    isDefault: true,
    isOwnerRole: true,
    permissions: { administrator: true },
  },
  {
    systemKey: "ADMIN",
    name: "Yönetici",
    color: "#E67E22",
    position: 80,
    hoist: true,
    mentionable: true,
    isDefault: true,
    isOwnerRole: false,
    permissions: {
      "server.view": true,
      "server.edit": true,
      "server.view_members": true,
      "server.invite_members": true,
      "server.kick_members": true,
      "server.ban_members": true,
      "server.manage_invites": true,
      "server.manage_roles": true,
      "channel.view": true,
      "channel.create": true,
      "channel.edit": true,
      "channel.delete": true,
      "channel.reorder": true,
      "channel.view_private": true,
      "text.send": true,
      "text.read": true,
      "text.delete": true,
      "text.edit": true,
      "text.attach_files": true,
      "text.embed_links": true,
      "text.use_reactions": true,
      "text.read_history": true,
      "voice.join": true,
      "voice.speak": true,
      "voice.manage": true,
      "video.join": true,
      "video.camera": true,
      "video.screen_share": true,
      "watch.view": true,
      "watch.start": true,
      "watch.control": true,
      "watch.become_host": true,
      "watch.assisted_external_sync": true,
      "watch.send_sync_command": true,
      "watch.start_countdown": true,
      "mod.manage_messages": true,
      "mod.view_reports": true,
    },
  },
  {
    systemKey: "MODERATOR",
    name: "Moderatör",
    color: "#3498DB",
    position: 60,
    hoist: true,
    mentionable: true,
    isDefault: true,
    isOwnerRole: false,
    permissions: {
      "server.view": true,
      "server.view_members": true,
      "server.invite_members": true,
      "server.kick_members": true,
      "channel.view": true,
      "channel.create": true,
      "channel.edit": true,
      "text.send": true,
      "text.read": true,
      "text.delete": true,
      "text.read_history": true,
      "voice.join": true,
      "voice.speak": true,
      "video.join": true,
      "watch.view": true,
      "watch.start": true,
      "watch.control": true,
      "watch.send_sync_command": true,
      "watch.start_countdown": true,
      "mod.manage_messages": true,
    },
  },
  {
    systemKey: "MEMBER",
    name: "Üye",
    color: "#95A5A6",
    position: 40,
    hoist: false,
    mentionable: true,
    isDefault: true,
    isOwnerRole: false,
    permissions: {
      "server.view": true,
      "server.view_members": true,
      "channel.view": true,
      "text.send": true,
      "text.read": true,
      "text.attach_files": true,
      "text.embed_links": true,
      "text.use_reactions": true,
      "text.read_history": true,
      "voice.join": true,
      "voice.speak": true,
      "video.join": true,
      "video.camera": true,
      "watch.view": true,
      "watch.start": true,
      "watch.queue_add": true,
      "watch.assisted_external_sync": true,
    },
  },
  {
    systemKey: "GUEST",
    name: "Misafir",
    color: "#7F8C8D",
    position: 20,
    hoist: false,
    mentionable: false,
    isDefault: true,
    isOwnerRole: false,
    permissions: {
      "server.view": true,
      "channel.view": true,
      "text.read": true,
      "text.read_history": true,
      "watch.view": true,
    },
  },
];

export const LEGACY_PERMISSION_MAP: Record<string, CommunityPermissionKey> = {
  "community.update": "server.edit",
  "community.delete": "server.delete",
  "member.invite": "server.invite_members",
  "member.kick": "server.kick_members",
  "member.ban": "server.ban_members",
  "channel.create": "channel.create",
  "channel.update": "channel.edit",
  "channel.delete": "channel.delete",
  "message.send": "text.send",
  "message.delete": "text.delete",
  "announcement.send": "text.send",
  "watch.start": "watch.start",
  "watch.control": "watch.control",
  "voice.join": "voice.join",
  "video.join": "video.join",
};

export function mergeRolePermissions(
  permissionMaps: RolePermissionsMap[],
): RolePermissionsMap {
  const merged: RolePermissionsMap = {};

  for (const map of permissionMaps) {
    for (const [key, value] of Object.entries(map)) {
      if (value) {
        merged[key as CommunityPermissionKey] = true;
      }
    }
  }

  if (merged[ADMINISTRATOR_PERMISSION]) {
    for (const key of ALL_COMMUNITY_PERMISSIONS) {
      merged[key] = true;
    }
  }

  return merged;
}

export function sanitizePermissionsInput(
  input: Record<string, boolean> | undefined,
): RolePermissionsMap {
  if (!input) {
    return {};
  }

  const sanitized: RolePermissionsMap = {};
  for (const key of ALL_COMMUNITY_PERMISSIONS) {
    if (input[key] === true) {
      sanitized[key] = true;
    }
  }
  return sanitized;
}
