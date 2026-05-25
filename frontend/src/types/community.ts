export type CommunityVisibility = "PUBLIC" | "INVITE_ONLY" | "PRIVATE";

export type CommunityCategory =
  | "FILM"
  | "SERIES"
  | "ANIME"
  | "GAME"
  | "EDUCATION"
  | "FRIENDS"
  | "GENERAL";

export type CommunityMemberRole =
  | "OWNER"
  | "ADMIN"
  | "MODERATOR"
  | "MEMBER"
  | "GUEST";

export type ChannelType =
  | "TEXT"
  | "VOICE"
  | "VIDEO"
  | "WATCH"
  | "ANNOUNCEMENT"
  | "PRIVATE"
  | "READ_ONLY"
  | "TICKET"
  | "STATS"
  | "LOG";

export type ChannelVisibility = "PUBLIC" | "PRIVATE";

export interface ChannelPermission {
  minRoleView: CommunityMemberRole;
  minRoleSend: CommunityMemberRole;
  minRoleWatchStart: CommunityMemberRole;
  minRoleWatchControl: CommunityMemberRole;
  minRoleVoice: CommunityMemberRole;
  minRoleVideo: CommunityMemberRole;
}

export interface CommunityChannel {
  id: string;
  communityId: string;
  name: string;
  slug: string;
  description: string | null;
  type: ChannelType;
  visibility: ChannelVisibility;
  position: number;
  backingRoomId: string | null;
  permissions: ChannelPermission | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  visibility: CommunityVisibility;
  category: CommunityCategory;
  ownerId: string;
  memberCount: number;
  channelCount: number;
  isMember: boolean;
  createdAt: string;
}

export interface CommunityMember {
  id: string;
  userId: string;
  role: CommunityMemberRole;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    handle: string;
    avatarUrl: string | null;
    presenceStatus: string;
    statusMessage: string | null;
  };
  roles?: CommunityRole[];
}

export type RolePermissionsMap = Partial<Record<string, boolean>>;

export interface CommunityRole {
  id: string;
  communityId: string;
  name: string;
  color: string;
  iconUrl: string | null;
  permissions: RolePermissionsMap;
  position: number;
  hoist: boolean;
  mentionable: boolean;
  isDefault: boolean;
  isOwnerRole: boolean;
  systemKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityRoleMember {
  assignmentId: string;
  memberId: string;
  userId: string;
  assignedAt: string;
  user: CommunityMember["user"];
}

export interface ChannelPermissionOverride {
  id: string;
  channelId: string;
  targetType: "ROLE" | "MEMBER";
  targetId: string;
  allow: RolePermissionsMap;
  deny: RolePermissionsMap;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  color?: string;
  iconUrl?: string | null;
  permissions?: RolePermissionsMap;
  position?: number;
  hoist?: boolean;
  mentionable?: boolean;
}

export interface UpdateRoleInput extends Partial<CreateRoleInput> {}

export interface ReorderRolesInput {
  roleIds: string[];
}

export interface UpdateChannelPermissionsInput {
  overrides: Array<{
    targetType: "ROLE" | "MEMBER";
    targetId: string;
    allow?: RolePermissionsMap;
    deny?: RolePermissionsMap;
  }>;
}

export interface CommunityDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  visibility: CommunityVisibility;
  category: CommunityCategory;
  ownerId: string;
  memberCount: number;
  setupCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityDetailResponse {
  community: CommunityDetail;
  owner: CommunityMember["user"];
  channels: CommunityChannel[];
  members: CommunityMember[];
  isMember: boolean;
  currentUserRole: CommunityMemberRole | null;
  canManageSettings?: boolean;
  canManageRoles?: boolean;
  canViewMembers?: boolean;
  setupCompleted?: boolean;
}

export interface CommunityListResponse {
  communities: CommunityListItem[];
  nextCursor: string | null;
}

export interface CommunityFilters {
  search?: string;
  category?: CommunityCategory;
  visibility?: CommunityVisibility;
  limit?: number;
  cursor?: string;
}

export interface CreateCommunityInput {
  name: string;
  description?: string;
  avatarUrl?: string | null;
  visibility?: CommunityVisibility;
  category?: CommunityCategory;
}

export interface CreateChannelInput {
  name: string;
  description?: string;
  type: ChannelType;
  visibility?: ChannelVisibility;
  permissions?: Partial<ChannelPermission>;
}

export interface CommunityInvite {
  id: string;
  code: string;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CommunityInvitePreview {
  invite: {
    code: string;
    community: Pick<
      CommunityDetail,
      "id" | "name" | "slug" | "description" | "avatarUrl" | "visibility" | "category"
    >;
  };
}

export interface CreateCommunityInviteInput {
  expiresAt?: string;
  maxUses?: number;
}

export interface UpdateCommunityInput {
  name?: string;
  description?: string;
  avatarUrl?: string | null;
  visibility?: CommunityVisibility;
  category?: CommunityCategory;
}

export interface UpdateMemberInput {
  role?: CommunityMemberRole;
}
