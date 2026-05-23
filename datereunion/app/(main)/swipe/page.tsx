"use client";

import { useEffect, useState } from "react";
import { Flame, SlidersHorizontal, X, Heart, Star, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipe } from "@/hooks/useSwipe";
import { useAuthStore } from "@/store/authStore";
import { SwipeCard } from "@/components/swipe/SwipeCard";
import { MatchModal } from "@/components/swipe/MatchModal";
import { cn } from "@/lib/utils";

export default function SwipePage() {
  const { profile } = useAuthStore();
  const {
    candidates,
    currentIndex,
    isLoading,
    showMatch,
    matchedProfile,
    currentCandidate,
    loadCandidates,
    swipe,
    hideMatchAnimation,
  } = useSwipe();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = currentCandidate();
  const next = candidates[currentIndex + 1];
  const isEmpty = !isLoading && (!candidates.length || currentIndex >= candidates.length);

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top py-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-coral fill-coral" />
          <span className="font-bold text-xl">Découvrir</span>
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative px-4 pb-4">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral to-volcano mx-auto animate-pulse" />
              <p className="text-muted-foreground text-sm">Chargement des profils…</p>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 px-8">
              <div className="text-6xl">🌺</div>
              <h3 className="font-bold text-xl">Plus de profils pour l&apos;instant</h3>
              <p className="text-muted-foreground text-sm">
                Reviens plus tard ou modifie tes filtres pour voir plus de monde.
              </p>
              <button
                onClick={loadCandidates}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-muted rounded-xl font-medium text-sm hover:bg-muted/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Actualiser
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Next card (behind) */}
            {next && (
              <SwipeCard
                profile={next}
                onSwipe={() => {}}
                isTop={false}
              />
            )}
            {/* Current card (top) */}
            <AnimatePresence>
              {current && (
                <SwipeCard
                  key={current.id}
                  profile={current}
                  onSwipe={(dir) => {
                    if (dir === "right") swipe("like");
                    else if (dir === "left") swipe("dislike");
                    else if (dir === "up") swipe("super-like");
                  }}
                  isTop
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isEmpty && !isLoading && current && (
        <div className="flex items-center justify-center gap-6 px-4 pb-6 flex-shrink-0">
          {/* Dislike */}
          <button
            onClick={() => swipe("dislike")}
            className="w-14 h-14 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center hover:border-red-400 hover:scale-110 transition-all active:scale-95"
          >
            <X className="w-7 h-7 text-red-400" />
          </button>

          {/* Super Like */}
          <button
            onClick={() => swipe("super-like")}
            className="w-12 h-12 rounded-full bg-card border-2 border-border shadow-md flex items-center justify-center hover:border-blue-400 hover:scale-110 transition-all active:scale-95"
          >
            <Star className="w-5 h-5 text-blue-400" />
          </button>

          {/* Like */}
          <button
            onClick={() => swipe("like")}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-coral to-volcano shadow-lg shadow-coral/30 flex items-center justify-center hover:scale-110 transition-all active:scale-95"
          >
            <Heart className="w-7 h-7 text-white fill-white" />
          </button>
        </div>
      )}

      {/* Match Modal */}
      {showMatch && matchedProfile && profile && (
        <MatchModal
          matchedProfile={matchedProfile}
          myProfile={profile}
          onClose={hideMatchAnimation}
        />
      )}
    </div>
  );
}
