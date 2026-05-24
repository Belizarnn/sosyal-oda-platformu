export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 50;

export const DEFAULT_MESSAGE_LIMIT = 50;
export const MAX_MESSAGE_LIMIT = 100;

export interface CursorAnchor {
  id: string;
  createdAt: Date;
}

export function clampLimit(
  value: number | undefined,
  defaultLimit: number,
  maxLimit: number,
): number {
  if (!value || value < 1) {
    return defaultLimit;
  }

  return Math.min(value, maxLimit);
}

export function buildOlderThanCursorFilter(cursor: CursorAnchor | null) {
  if (!cursor) {
    return {};
  }

  return {
    OR: [
      { createdAt: { lt: cursor.createdAt } },
      {
        createdAt: cursor.createdAt,
        id: { lt: cursor.id },
      },
    ],
  };
}

export function resolveNextCursor<T extends { id: string }>(
  items: T[],
  limit: number,
): string | null {
  if (items.length < limit) {
    return null;
  }

  return items[items.length - 1]?.id ?? null;
}

export function resolveOlderMessageCursor<T extends { id: string }>(
  itemsAsc: T[],
  hasMore: boolean,
): string | null {
  if (!hasMore || itemsAsc.length === 0) {
    return null;
  }

  return itemsAsc[0]?.id ?? null;
}
