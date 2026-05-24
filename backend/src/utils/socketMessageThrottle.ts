import type { AuthenticatedSocket } from "../socket/types";

const MIN_INTERVAL_MS = 1000;
const WINDOW_MS = 5000;
const MAX_MESSAGES_IN_WINDOW = 8;

const MESSAGE_THROTTLE_ERROR = "Çok hızlı mesaj gönderiyorsun.";

interface MessageThrottleState {
  lastMessageAt: number;
  recentTimestamps: number[];
}

function getThrottleState(socket: AuthenticatedSocket): MessageThrottleState {
  if (!socket.data.messageThrottle) {
    socket.data.messageThrottle = {
      lastMessageAt: 0,
      recentTimestamps: [],
    };
  }

  return socket.data.messageThrottle;
}

export function assertMessageThrottle(socket: AuthenticatedSocket): void {
  const now = Date.now();
  const state = getThrottleState(socket);

  if (now - state.lastMessageAt < MIN_INTERVAL_MS) {
    throw new Error(MESSAGE_THROTTLE_ERROR);
  }

  state.recentTimestamps = state.recentTimestamps.filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (state.recentTimestamps.length >= MAX_MESSAGES_IN_WINDOW) {
    throw new Error(MESSAGE_THROTTLE_ERROR);
  }

  state.lastMessageAt = now;
  state.recentTimestamps.push(now);
}

export { MESSAGE_THROTTLE_ERROR };
