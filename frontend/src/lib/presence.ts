export const PRESENCE_STATUSES = [
  "ONLINE",
  "IDLE",
  "IN_ROOM",
  "WATCHING",
  "STUDYING",
  "LISTENING",
  "GAMING",
  "OFFLINE",
] as const;

export type PresenceStatusValue = (typeof PRESENCE_STATUSES)[number];

export interface PresenceMeta {
  value: PresenceStatusValue;
  label: string;
  dotClass: string;
  textClass: string;
}

export const PRESENCE_META: Record<PresenceStatusValue, PresenceMeta> = {
  ONLINE: {
    value: "ONLINE",
    label: "Online",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]",
    textClass: "text-emerald-300",
  },
  IDLE: {
    value: "IDLE",
    label: "Idle",
    dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]",
    textClass: "text-amber-300",
  },
  IN_ROOM: {
    value: "IN_ROOM",
    label: "In Room",
    dotClass: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.45)]",
    textClass: "text-violet-300",
  },
  WATCHING: {
    value: "WATCHING",
    label: "Watching",
    dotClass: "bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.45)]",
    textClass: "text-pink-300",
  },
  STUDYING: {
    value: "STUDYING",
    label: "Studying",
    dotClass: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.45)]",
    textClass: "text-sky-300",
  },
  LISTENING: {
    value: "LISTENING",
    label: "Listening",
    dotClass: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.45)]",
    textClass: "text-purple-300",
  },
  GAMING: {
    value: "GAMING",
    label: "Gaming",
    dotClass: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.45)]",
    textClass: "text-orange-300",
  },
  OFFLINE: {
    value: "OFFLINE",
    label: "Offline",
    dotClass: "bg-zinc-500",
    textClass: "text-zinc-400",
  },
};

export const SELECTABLE_PRESENCE_STATUSES = PRESENCE_STATUSES.filter(
  (status) => status !== "OFFLINE",
);

const PRESENCE_LABEL_KEYS: Record<PresenceStatusValue, string> = {
  ONLINE: "presence.online",
  IDLE: "presence.idle",
  IN_ROOM: "presence.inRoom",
  WATCHING: "presence.watching",
  STUDYING: "presence.studying",
  LISTENING: "presence.listening",
  GAMING: "presence.gaming",
  OFFLINE: "presence.offline",
};

export function getPresenceLabel(
  status: string,
  t: (key: string) => string,
): string {
  if (status in PRESENCE_LABEL_KEYS) {
    return t(PRESENCE_LABEL_KEYS[status as PresenceStatusValue]);
  }

  return t("presence.online");
}

export function getPresenceMeta(status: string): PresenceMeta {
  if (status in PRESENCE_META) {
    return PRESENCE_META[status as PresenceStatusValue];
  }

  return PRESENCE_META.ONLINE;
}
