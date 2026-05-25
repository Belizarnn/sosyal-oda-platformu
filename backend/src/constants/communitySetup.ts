import { ChannelType, CommunityBotType } from "@prisma/client";

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

export const CHANNEL_TEMPLATE_DEFINITIONS: Record<
  ChannelTemplateKey,
  {
    name: string;
    slug: string;
    type: ChannelType;
    icon: string;
    recommended: boolean;
    defaultSelected: boolean;
  }
> = {
  announcements: {
    name: "duyurular",
    slug: "duyurular",
    type: ChannelType.ANNOUNCEMENT,
    icon: "#",
    recommended: true,
    defaultSelected: true,
  },
  rules: {
    name: "kurallar",
    slug: "kurallar",
    type: ChannelType.READ_ONLY,
    icon: "#",
    recommended: true,
    defaultSelected: true,
  },
  complaint: {
    name: "sikayet",
    slug: "sikayet",
    type: ChannelType.TEXT,
    icon: "#",
    recommended: false,
    defaultSelected: false,
  },
  chat: {
    name: "sohbet",
    slug: "sohbet",
    type: ChannelType.TEXT,
    icon: "#",
    recommended: true,
    defaultSelected: true,
  },
  watch: {
    name: "birlikte-izle",
    slug: "birlikte-izle",
    type: ChannelType.WATCH,
    icon: "#",
    recommended: true,
    defaultSelected: true,
  },
  voice: {
    name: "genel-ses",
    slug: "genel-ses",
    type: ChannelType.VOICE,
    icon: "🔊",
    recommended: true,
    defaultSelected: true,
  },
  video: {
    name: "goruntulu-sohbet",
    slug: "goruntulu-sohbet",
    type: ChannelType.VIDEO,
    icon: "🎥",
    recommended: false,
    defaultSelected: false,
  },
  ticket: {
    name: "ticket-destek",
    slug: "ticket-destek",
    type: ChannelType.TICKET,
    icon: "🎫",
    recommended: false,
    defaultSelected: false,
  },
  stats: {
    name: "sunucu-istatistik",
    slug: "sunucu-istatistik",
    type: ChannelType.STATS,
    icon: "📊",
    recommended: false,
    defaultSelected: false,
  },
  logs: {
    name: "log-kayitlari",
    slug: "log-kayitlari",
    type: ChannelType.LOG,
    icon: "📝",
    recommended: false,
    defaultSelected: false,
  },
};

export const DEFAULT_SELECTED_CHANNELS: ChannelTemplateKey[] = (
  Object.entries(CHANNEL_TEMPLATE_DEFINITIONS) as Array<
    [ChannelTemplateKey, (typeof CHANNEL_TEMPLATE_DEFINITIONS)[ChannelTemplateKey]]
  >
)
  .filter(([, def]) => def.defaultSelected)
  .map(([key]) => key);

export const BOT_SUGGESTED_CHANNELS: Partial<Record<CommunityBotType, ChannelTemplateKey[]>> = {
  [CommunityBotType.LOG]: ["logs"],
  [CommunityBotType.TICKET]: ["ticket", "complaint"],
  [CommunityBotType.STATS]: ["stats"],
  [CommunityBotType.REACTION_ROLE]: ["chat"],
};

export type BotSettingsMap = Record<string, unknown>;

export const BOT_DEFINITIONS: Record<
  CommunityBotType,
  {
    recommended: boolean;
    defaultEnabled: boolean;
    defaultSettings: BotSettingsMap;
  }
> = {
  [CommunityBotType.MODERATION]: {
    recommended: true,
    defaultEnabled: true,
    defaultSettings: {
      profanityFilter: true,
      spamFilter: true,
      floodFilter: true,
      capsFilter: false,
      linkFilter: false,
      mentionSpamFilter: true,
      duplicateFilter: true,
      action: "delete",
      logChannelSlug: "log-kayitlari",
    },
  },
  [CommunityBotType.LOG]: {
    recommended: true,
    defaultEnabled: true,
    defaultSettings: {
      logChannelSlug: "log-kayitlari",
      events: {
        memberJoin: true,
        memberLeave: true,
        memberKick: true,
        memberBan: true,
        messageDelete: true,
        messageEdit: true,
        channelCreate: true,
        channelDelete: true,
        roleCreate: true,
        roleUpdate: true,
        roleDelete: true,
        roleAssign: true,
        roleRemove: true,
        watchStart: true,
        watchStop: true,
        ticketOpen: true,
        ticketClose: true,
        inviteCreate: true,
        inviteUse: true,
      },
    },
  },
  [CommunityBotType.WELCOME]: {
    recommended: true,
    defaultEnabled: true,
    defaultSettings: {
      welcomeChannelSlug: "sohbet",
      welcomeMessage:
        "Hoş geldin {user}! Sunucumuza katıldığın için mutluyuz. Kuralları okumayı unutma.",
      leaveMessage: "{user} sunucudan ayrıldı.",
      dmWelcome: false,
      autoRoleSystemKey: "MEMBER",
      showRulesChannelSlug: "kurallar",
    },
  },
  [CommunityBotType.TICKET]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      panelChannelSlug: "ticket-destek",
      staffRoleSystemKey: "MODERATOR",
      categories: ["Destek", "Şikayet", "Öneri", "Teknik sorun", "Moderatöre ulaş"],
      createTranscript: true,
    },
  },
  [CommunityBotType.REACTION_ROLE]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      channelSlug: "rol-secim",
      messageTitle: "Rol seç",
      items: [
        { emoji: "🎬", roleName: "Film", color: "#E74C3C" },
        { emoji: "📺", roleName: "Dizi", color: "#3498DB" },
        { emoji: "🎮", roleName: "Oyun", color: "#2ECC71" },
      ],
    },
  },
  [CommunityBotType.INVITE]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      trackInvites: true,
      rewardRoleSystemKey: null,
      antiAbuse: true,
    },
  },
  [CommunityBotType.GIVEAWAY]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      defaultChannelSlug: "sohbet",
      joinMethod: "reaction",
    },
  },
  [CommunityBotType.STATS]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      statsChannelSlug: "sunucu-istatistik",
      updateIntervalMinutes: 60,
      metrics: ["members", "online", "messagesDaily", "activeChannels"],
    },
  },
  [CommunityBotType.AUTO_REPLY]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      rules: [
        { trigger: "!kurallar", response: "Kurallar kanalını kontrol et: #kurallar" },
        { trigger: "!yardim", response: "Yardım için moderatörlere ulaşabilirsin." },
      ],
    },
  },
  [CommunityBotType.WEBHOOK]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      rateLimitPerMinute: 30,
    },
  },
  [CommunityBotType.MUSIC]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      queueChannelSlug: "genel-ses",
      mode: "queue_planner",
    },
  },
  [CommunityBotType.FUN]: {
    recommended: false,
    defaultEnabled: false,
    defaultSettings: {
      dailyQuestion: false,
      pollEnabled: true,
      watchSuggestion: true,
    },
  },
  [CommunityBotType.SECURITY]: {
    recommended: true,
    defaultEnabled: true,
    defaultSettings: {
      raidProtection: true,
      newAccountWarning: true,
      suspiciousLinkCheck: true,
      joinRateLimit: 10,
      slowModeSuggestion: true,
    },
  },
};

export const DEFAULT_SELECTED_BOTS: Partial<Record<CommunityBotType, boolean>> = Object.fromEntries(
  Object.entries(BOT_DEFINITIONS).map(([type, def]) => [type, def.defaultEnabled]),
) as Partial<Record<CommunityBotType, boolean>>;

export const ALL_BOT_TYPES = Object.values(CommunityBotType);

export const BOT_EXTRA_CHANNELS: Record<string, { name: string; slug: string; type: ChannelType }> =
  {
    "rol-secim": { name: "rol-secim", slug: "rol-secim", type: ChannelType.TEXT },
  };

export const BOT_PERMISSION_KEYS = [
  "bot.manage",
  "webhook.manage",
  "moderation.manage",
  "ticket.manage",
  "giveaway.manage",
  "reaction_role.manage",
  "stats.view",
  "logs.view",
  "auto_reply.manage",
] as const;

export type BotPermissionKey = (typeof BOT_PERMISSION_KEYS)[number];
