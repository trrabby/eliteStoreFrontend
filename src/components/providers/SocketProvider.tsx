"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  pushNotification,
  setUnreadCount,
  markAllRead,
} from "@/store/slices/notificationSlice";

let socket: Socket | null = null;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (!auth.accessToken) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000", {
      auth: { token: auth.accessToken },
      reconnection: true,
    });

    socket.on("connect", () => {
      socket?.emit("notification:getUnreadCount");
    });

    socket.on("notification:new", (notification) => {
      dispatch(pushNotification(notification));
    });

    socket.on("notification:unreadCount", ({ count }) => {
      dispatch(setUnreadCount(count));
    });

    socket.on("notification:allRead", () => {
      dispatch(markAllRead());
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [auth.accessToken, dispatch]);

  return <>{children}</>;
}

// export socket for use in other components
export const getSocket = () => socket;
