"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { savePushSubscription } from "@/services/notification.service";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const user = useAppSelector(selectCurrentUser);
  const subscribed = useRef(false);

  useEffect(() => {
    if (!user || subscribed.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Wait until SW is active
        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Check existing subscription
        let subscription = await registration.pushManager.getSubscription();

        // Subscribe if none exists
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              VAPID_PUBLIC_KEY,
            ) as BufferSource,
          });
        }

        // POST subscription to backend
        const fd = new FormData();
        fd.append(
          "data",
          JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(
                String.fromCharCode(
                  ...new Uint8Array(subscription.getKey("p256dh")!),
                ),
              ),
              auth: btoa(
                String.fromCharCode(
                  ...new Uint8Array(subscription.getKey("auth")!),
                ),
              ),
            },
          }),
        );

        await savePushSubscription(fd);
        subscribed.current = true;
      } catch (err) {
        // Silently fail — non-critical
        console.debug("Push registration failed:", err);
      }
    };

    register();
  }, [user]);
}
