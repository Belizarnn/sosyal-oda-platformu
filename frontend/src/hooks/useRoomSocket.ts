"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { createSocket, type AppSocket } from "@/lib/socket";

export function useRoomSocket(roomId: string, enabled: boolean) {
  const [socket, setSocket] = useState<AppSocket | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!enabled || !token) {
      setSocket(null);
      return;
    }

    const instance = createSocket(token);
    setSocket(instance);
    instance.emit("room:join", { roomId });

    return () => {
      instance.emit("room:leave", { roomId });
      setSocket(null);
    };
  }, [enabled, roomId]);

  return socket;
}
