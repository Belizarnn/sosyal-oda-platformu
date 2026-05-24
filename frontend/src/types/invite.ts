export interface InvitePreviewRoom {
  id: string;
  name: string;
  description: string | null;
  category: string;
  type: string;
  currentUserCount: number;
  maxUserCount: number;
}

export interface InvitePreview {
  room: InvitePreviewRoom;
  owner: {
    id: string;
    username: string;
    handle: string;
    avatarUrl: string | null;
  };
  requiresPassword: boolean;
  canPreview: boolean;
  inviteEnabled: boolean;
}

export interface InviteSettings {
  inviteCode: string;
  inviteUrl: string;
  inviteEnabled: boolean;
  inviteUpdatedAt: string | null;
}

export interface InviteJoinInput {
  password?: string;
  inviteCode?: string;
}
