"use client";

import { Heart, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-coral to-volcano flex items-center justify-center shadow-xl mb-6">
        <Heart className="w-10 h-10 text-white fill-white" />
      </div>
      <WifiOff className="w-8 h-8 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-extrabold mb-2">Pas de connexion</h1>
      <p className="text-muted-foreground mb-8 max-w-xs">
        Tu es hors ligne. Reconnecte-toi pour continuer à utiliser DateRéunion.
      </p>
      <Link
        href="/swipe"
        className="px-6 py-3 bg-coral text-white font-semibold rounded-2xl shadow hover:bg-coral/90 transition-colors"
      >
        Réessayer
      </Link>
    </div>
  );
}
