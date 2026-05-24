import { AccessToken } from "livekit-server-sdk";

import { env } from "../config/env";
import { AppError } from "../utils/asyncHandler";

export interface LiveKitUser {
  id: string;
  username: string;
}

export interface LiveKitRoomTarget {
  id: string;
}

export interface LiveKitTokenResult {
  token: string;
  roomName: string;
  livekitUrl: string;
}

function assertLiveKitConfigured() {
  if (!env.livekitUrl || !env.livekitApiKey || !env.livekitApiSecret) {
    throw new AppError(
      503,
      "Voice bağlantısı hazırlanamadı. LiveKit yapılandırması eksik.",
    );
  }
}

export async function createLiveKitToken(
  user: LiveKitUser,
  room: LiveKitRoomTarget,
): Promise<LiveKitTokenResult> {
  assertLiveKitConfigured();

  const roomName = room.id;

  try {
    const accessToken = new AccessToken(env.livekitApiKey, env.livekitApiSecret, {
      identity: user.id,
      name: user.username,
    });

    accessToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await accessToken.toJwt();

    return {
      token,
      roomName,
      livekitUrl: env.livekitUrl,
    };
  } catch {
    throw new AppError(500, "Voice bağlantısı hazırlanamadı.");
  }
}
