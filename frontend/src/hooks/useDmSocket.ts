"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { createSocket, type AppSocket } from "@/lib/socket";

export function useDmSocket(conversationId: string, enabled: boolean) {
  const [socket, setSocket] = useState<AppSocket | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!enabled || !token) {
      setSocket(null);
      return;
    }

    const instance = createSocket(token);
    setSocket(instance);

    instance.emit("dm:join", { conversationId });

    return () => {
      instance.emit("dm:leave", { conversationId });
      setSocket(null);
    };
  }, [conversationId, enabled]);

  return socket;
}
