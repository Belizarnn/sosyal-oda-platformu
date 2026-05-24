import { getToken } from "./auth-storage";
import { API_BASE_URL } from "./env";

const SESSION_STORAGE_KEY = "sosyal_oda_analytics_session";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null
>;

function getSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(SESSION_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function trackEvent(
  eventName: string,
  properties?: AnalyticsProperties,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  void fetch(`${API_BASE_URL}/analytics/events`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      eventName,
      properties,
      sessionId: getSessionId(),
      path: window.location.pathname,
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics failures must not affect UX.
  });
}
