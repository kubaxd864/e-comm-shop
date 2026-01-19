"use client";
import { createContext, useEffect } from "react";
import { socket } from "@/lib/socket";
import { useUser } from "@/hooks/useUser";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useUser();
  useEffect(() => {
    if (!user) return;
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
