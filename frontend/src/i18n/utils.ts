import type { Locale } from "./languages";

export type TranslationDictionary = Record<string, string>;

export type TranslationParams = Record<string, string | number>;

export function interpolate(
  template: string,
  params?: TranslationParams,
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function translateKey(
  dictionary: TranslationDictionary,
  key: string,
  params?: TranslationParams,
): string {
  const value = dictionary[key];

  if (!value) {
    return key;
  }

  return interpolate(value, params);
}

export function mergeDictionaries(
  ...dictionaries: TranslationDictionary[]
): TranslationDictionary {
  return Object.assign({}, ...dictionaries);
}

export function getLocaleDocumentAttributes(locale: Locale): {
  lang: string;
  dir: "ltr" | "rtl";
} {
  if (locale === "fa") {
    return { lang: "fa", dir: "rtl" };
  }

  if (locale === "zh") {
    return { lang: "zh-CN", dir: "ltr" };
  }

  return { lang: locale, dir: "ltr" };
}

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  GAME: "categories.game",
  FILM: "categories.film",
  STUDY: "categories.study",
  ANIME: "categories.anime",
  MUSIC: "categories.music",
  CHAT: "categories.chat",
  SOFTWARE: "categories.software",
  SPORTS: "categories.sports",
  ALL: "common.all",
};

export function getCategoryLabel(
  category: string,
  t: (key: string) => string,
): string {
  return t(CATEGORY_LABEL_KEYS[category] ?? "categories.other");
}

const REPORT_STATUS_LABEL_KEYS = {
  OPEN: "admin.report.open",
  REVIEWED: "admin.report.reviewed",
  RESOLVED: "admin.report.resolved",
  REJECTED: "admin.report.rejected",
} as const;

export function getReportStatusLabel(
  status: keyof typeof REPORT_STATUS_LABEL_KEYS,
  t: (key: string) => string,
): string {
  return t(REPORT_STATUS_LABEL_KEYS[status]);
}

const REPORT_TARGET_LABEL_KEYS = {
  USER: "admin.report.user",
  MESSAGE: "admin.report.message",
  ROOM: "admin.report.room",
} as const;

export function getReportTargetLabel(
  targetType: keyof typeof REPORT_TARGET_LABEL_KEYS,
  t: (key: string) => string,
): string {
  return t(REPORT_TARGET_LABEL_KEYS[targetType]);
}

const FEEDBACK_TYPE_LABEL_KEYS = {
  GENERAL: "feedback.types.general",
  BUG: "feedback.types.bug",
  FEATURE_REQUEST: "feedback.types.featureRequest",
  UX: "feedback.types.ux",
} as const;

export function getFeedbackTypeLabel(
  type: keyof typeof FEEDBACK_TYPE_LABEL_KEYS,
  t: (key: string) => string,
): string {
  return t(FEEDBACK_TYPE_LABEL_KEYS[type]);
}

const FEEDBACK_STATUS_LABEL_KEYS = {
  OPEN: "feedback.status.open",
  REVIEWED: "feedback.status.reviewed",
  PLANNED: "feedback.status.planned",
  RESOLVED: "feedback.status.resolved",
  REJECTED: "feedback.status.rejected",
} as const;

export function getFeedbackStatusLabel(
  status: keyof typeof FEEDBACK_STATUS_LABEL_KEYS,
  t: (key: string) => string,
): string {
  return t(FEEDBACK_STATUS_LABEL_KEYS[status]);
}

const DISCOVER_SORT_LABEL_KEYS = {
  trending: "discover.sort.trending",
  newest: "discover.sort.new",
  active: "discover.sort.active",
  recommended: "discover.sort.recommended",
} as const;

export function getDiscoverSortLabel(
  sort: keyof typeof DISCOVER_SORT_LABEL_KEYS,
  t: (key: string) => string,
): string {
  return t(DISCOVER_SORT_LABEL_KEYS[sort]);
}

const ROOM_TYPE_LABEL_KEYS = {
  PUBLIC: "roomType.public",
  PRIVATE: "roomType.private",
  INVITE_ONLY: "roomType.inviteOnly",
  PASSWORD_PROTECTED: "roomType.password",
} as const;

export function getRoomTypeLabel(
  type: keyof typeof ROOM_TYPE_LABEL_KEYS | string,
  t: (key: string) => string,
): string {
  if (type in ROOM_TYPE_LABEL_KEYS) {
    return t(ROOM_TYPE_LABEL_KEYS[type as keyof typeof ROOM_TYPE_LABEL_KEYS]);
  }

  return type;
}

const ROOM_ROLE_LABEL_KEYS = {
  OWNER: "rooms.role.owner",
  MODERATOR: "rooms.role.moderator",
  MEMBER: "rooms.role.member",
} as const;

export function getRoomRoleLabel(
  role: keyof typeof ROOM_ROLE_LABEL_KEYS | string,
  t: (key: string) => string,
): string {
  if (role in ROOM_ROLE_LABEL_KEYS) {
    return t(ROOM_ROLE_LABEL_KEYS[role as keyof typeof ROOM_ROLE_LABEL_KEYS]);
  }

  return role;
}
