export type ChannelTemplateKey =
  | "announcements"
  | "rules"
  | "complaint"
  | "chat"
  | "watch"
  | "voice"
  | "video"
  | "ticket"
  | "stats"
  | "logs";

export type CommunityBotType =
  | "MODERATION"
  | "LOG"
  | "WELCOME"
  | "TICKET"
  | "REACTION_ROLE"
  | "INVITE"
  | "GIVEAWAY"
  | "STATS"
  | "AUTO_REPLY"
  | "WEBHOOK"
  | "MUSIC"
  | "FUN"
  | "SECURITY";

export interface ChannelTemplateDefinition {
  name: string;
  slug: string;
  type: string;
  icon: string;
  recommended: boolean;
  defaultSelected: boolean;
}

export interface CommunityBot {
  id: string;
  communityId: string;
  type: CommunityBotType;
  enabled: boolean;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CommunitySetupState {
  setupCompleted: boolean;
  selectedChannels: ChannelTemplateKey[];
  selectedBots: Record<string, boolean>;
  channelTemplates: Record<ChannelTemplateKey, ChannelTemplateDefinition>;
}

export const DEFAULT_SELECTED_CHANNELS: ChannelTemplateKey[] = [
  "announcements",
  "rules",
  "chat",
  "watch",
  "voice",
];

export const DEFAULT_SELECTED_BOTS: Record<CommunityBotType, boolean> = {
  MODERATION: true,
  LOG: true,
  WELCOME: true,
  TICKET: false,
  REACTION_ROLE: false,
  INVITE: false,
  GIVEAWAY: false,
  STATS: false,
  AUTO_REPLY: false,
  WEBHOOK: false,
  MUSIC: false,
  FUN: false,
  SECURITY: true,
};

export const ALL_BOT_TYPES: CommunityBotType[] = [
  "MODERATION",
  "LOG",
  "WELCOME",
  "TICKET",
  "REACTION_ROLE",
  "INVITE",
  "GIVEAWAY",
  "STATS",
  "AUTO_REPLY",
  "WEBHOOK",
  "MUSIC",
  "FUN",
  "SECURITY",
];
