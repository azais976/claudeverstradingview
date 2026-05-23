"use client";

import { useState, useCallback } from "react";

// Detects if we're running inside Capacitor (native app)
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as { Capacitor?: { isNative?: boolean } }).Capacitor?.isNative;
}

export function useNativeCamera() {
  const [loading, setLoading] = useState(false);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    try {
      if (isNative()) {
        // Use Capacitor Camera plugin for native iOS/Android
        const { Camera, CameraResultType, CameraSource } = await import(
          "@capacitor/camera"
        );
        const photo = await Camera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          saveToGallery: false,
        });
        return photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : null;
      } else {
        // Web fallback: use getUserMedia
        return null; // handled by VerificationFlow component
      }
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    try {
      if (isNative()) {
        const { Camera, CameraResultType, CameraSource } = await import(
          "@capacitor/camera"
        );
        const photo = await Camera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos,
        });
        return photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : null;
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { takePhoto, pickFromGallery, loading, isNative: isNative() };
}
