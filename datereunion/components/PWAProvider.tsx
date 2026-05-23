"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    // Capture install prompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  return (
    <>
      {children}

      {/* Install banner */}
      {showBanner && (
        <div className="fixed bottom-24 left-4 right-4 z-50 bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral to-volcano flex items-center justify-center flex-shrink-0 shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-72x72.png" alt="DateRéunion" className="w-10 h-10 rounded-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Installer DateRéunion</p>
            <p className="text-xs text-muted-foreground">Ajouter sur ton écran d&apos;accueil</p>
          </div>
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3 py-2 bg-coral text-white text-xs font-semibold rounded-xl shadow hover:bg-coral/90 transition-colors flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Installer
          </button>
          <button onClick={handleDismiss} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
