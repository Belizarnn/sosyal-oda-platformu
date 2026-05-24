import type { User } from "@prisma/client";
import { getPublicPremiumProfileFields } from "./premium";

export type SafeUser = Omit<User, "passwordHash">;

export function sanitizeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export type PublicUserProfile = {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  statusMessage: string | null;
  presenceStatus: User["presenceStatus"];
  profileInterests: string[];
  createdAt: string;
  lastSeenAt: string | null;
  isPremium: boolean;
  premiumBadgeVisible: boolean;
  premiumProfileFrame: string | null;
  premiumAvatarEffect: string | null;
  activity: {
    memberSince: string;
    recentRooms: {
      id: string;
      name: string;
      category: string;
    }[];
  };
};

export function formatPublicProfile(
  user: User,
  recentRooms: PublicUserProfile["activity"]["recentRooms"],
): PublicUserProfile {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    bannerUrl: user.bannerUrl,
    bio: user.bio,
    statusMessage: user.statusMessage,
    presenceStatus: user.presenceStatus,
    profileInterests: user.profileInterests,
    createdAt: user.createdAt.toISOString(),
    lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
    ...getPublicPremiumProfileFields(user),
    activity: {
      memberSince: user.createdAt.toISOString(),
      recentRooms,
    },
  };
}

function sanitizeOptionalUrl(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Geçerli bir URL girin (http:// veya https://)");
  }

  return trimmed;
}

export function sanitizeProfileUrls(input: {
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}) {
  const result: { avatarUrl?: string | null; bannerUrl?: string | null } = {};

  if (input.avatarUrl !== undefined) {
    result.avatarUrl = sanitizeOptionalUrl(input.avatarUrl) ?? null;
  }

  if (input.bannerUrl !== undefined) {
    result.bannerUrl = sanitizeOptionalUrl(input.bannerUrl) ?? null;
  }

  return result;
}

export function normalizeProfileInterests(interests: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const interest of interests) {
    const trimmed = interest.trim();

    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(trimmed);

    if (normalized.length >= 12) {
      break;
    }
  }

  return normalized;
}
