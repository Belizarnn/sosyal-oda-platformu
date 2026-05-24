const LAST_VOICE_ROOM_ID_KEY = "sosyal-oda:lastVoiceRoomId";
const LAST_VOICE_ROOM_NAME_KEY = "sosyal-oda:lastVoiceRoomName";

export function persistLastVoiceRoom(roomId: string, roomName: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(LAST_VOICE_ROOM_ID_KEY, roomId);
  localStorage.setItem(LAST_VOICE_ROOM_NAME_KEY, roomName);
}

export function clearLastVoiceRoom(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(LAST_VOICE_ROOM_ID_KEY);
  localStorage.removeItem(LAST_VOICE_ROOM_NAME_KEY);
}

export function readLastVoiceRoom(): { roomId: string; roomName: string } | null {
  if (typeof window === "undefined") {
    return null;
  }

  const roomId = localStorage.getItem(LAST_VOICE_ROOM_ID_KEY);
  const roomName = localStorage.getItem(LAST_VOICE_ROOM_NAME_KEY);

  if (!roomId || !roomName) {
    return null;
  }

  return { roomId, roomName };
}
