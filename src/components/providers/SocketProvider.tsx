/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  pushNotification,
  setUnreadCount,
  markAllRead,
} from "@/store/slices/notificationSlice";
import { getAccessToken } from "@/services/auth.service";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    getAccessToken().then((token) => {
      setAccessToken(token);
    });
  }, []);

  useEffect(() => {
    // guard — only runs in browser
    if (!accessToken || typeof window === "undefined") return;

    let socket: any;

    // dynamic import keeps socket.io out of SSR bundle entirely
    import("socket.io-client").then(({ io }) => {
      socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000",
        {
          auth: { token: accessToken },
          reconnection: true,
        },
      );

      socket.on("connect", () => {
        socket.emit("notification:getUnreadCount");
      });

      socket.on("notification:new", (notification: any) => {
        dispatch(pushNotification(notification));
      });

      socket.on("notification:unreadCount", ({ count }: { count: number }) => {
        dispatch(setUnreadCount(count));
      });

      socket.on("notification:allRead", () => {
        dispatch(markAllRead());
      });
    });

    return () => {
      socket?.disconnect();
    };
  }, [accessToken, dispatch]);

  return <>{children}</>;
}
