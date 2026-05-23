"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useSwipeStore } from "@/store/swipeStore";
import { useAuthStore } from "@/store/authStore";
import type { SwipeAction } from "@/types";

export function useSwipe() {
  const supabase = createClient();
  const { profile } = useAuthStore();
  const {
    candidates,
    currentIndex,
    filters,
    isLoading,
    showMatch,
    matchedProfile,
    setCandidates,
    nextCandidate,
    setLoading,
    showMatchAnimation,
    hideMatchAnimation,
    currentCandidate,
  } = useSwipeStore();

  const loadCandidates = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_swipe_candidates", {
        p_profile_id: profile.id,
        p_max_distance: filters.max_distance_km,
        p_min_age: filters.min_age,
        p_max_age: filters.max_age,
        p_genders: filters.gender.length > 0 ? filters.gender : null,
        p_date_modes: filters.date_modes.length > 0 ? filters.date_modes : null,
        p_limit: 20,
      });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error("Error loading candidates:", err);
      toast.error("Impossible de charger les profils");
    } finally {
      setLoading(false);
    }
  }, [profile, filters, supabase, setCandidates, setLoading]);

  const swipe = useCallback(
    async (action: SwipeAction) => {
      const candidate = currentCandidate();
      if (!profile || !candidate) return;

      // Optimistically move to next
      nextCandidate();

      try {
        const { error } = await supabase.from("swipes").insert({
          swiper_id: profile.id,
          swiped_id: candidate.id,
          action,
        });

        if (error) throw error;

        // Check if it created a match (listen via Realtime or check notifications)
        if (action !== "dislike") {
          // Check for existing reverse swipe
          const { data: reverseSwipe } = await supabase
            .from("swipes")
            .select("id")
            .eq("swiper_id", candidate.id)
            .eq("swiped_id", profile.id)
            .in("action", ["like", "super-like"])
            .maybeSingle();

          if (reverseSwipe) {
            showMatchAnimation(candidate);
          } else if (action === "super-like") {
            toast.success(`Super Like envoyé à ${candidate.display_name} ⭐`, {
              duration: 2000,
            });
          }
        }

        // Load more candidates when running low
        if (currentIndex >= candidates.length - 5) {
          loadCandidates();
        }
      } catch (err) {
        console.error("Swipe error:", err);
      }
    },
    [
      profile,
      currentCandidate,
      nextCandidate,
      supabase,
      showMatchAnimation,
      currentIndex,
      candidates.length,
      loadCandidates,
    ]
  );

  return {
    candidates,
    currentIndex,
    isLoading,
    showMatch,
    matchedProfile,
    currentCandidate,
    loadCandidates,
    swipe,
    hideMatchAnimation,
  };
}
