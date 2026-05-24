export interface VoiceParticipant {
  id: string;
  username: string;
  handle: string;
  avatarUrl?: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  presenceStatus?: string;
}

export interface VoiceState {
  isConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
}

export interface VoiceTokenResponse {
  provider: "livekit";
  roomId: string;
  roomName: string;
  identity: string;
  displayName: string;
  token: string;
  livekitUrl: string;
}
