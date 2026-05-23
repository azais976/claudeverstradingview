"use client";

import { useEffect } from "react";
import { isNative } from "./useNativeCamera";

export function useNativeNotifications() {
  useEffect(() => {
    if (!isNative()) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") return;

      await PushNotifications.register();

      const regListener = await PushNotifications.addListener(
        "registration",
        (token) => {
          // Send FCM/APNs token to Supabase edge function or your backend
          console.log("[Push] Token:", token.value);
          // TODO: store token in profiles table
        }
      );

      cleanup = () => {
        regListener.remove();
      };
    })();

    return () => cleanup?.();
  }, []);
}
