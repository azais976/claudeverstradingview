"use client";

import { create } from "zustand";
import type { UserProfile, SwipeFilters } from "@/types";

interface SwipeState {
  candidates: UserProfile[];
  currentIndex: number;
  filters: SwipeFilters;
  isLoading: boolean;
  showMatch: boolean;
  matchedProfile: UserProfile | null;

  setCandidates: (candidates: UserProfile[]) => void;
  nextCandidate: () => void;
  setFilters: (filters: Partial<SwipeFilters>) => void;
  setLoading: (v: boolean) => void;
  showMatchAnimation: (profile: UserProfile) => void;
  hideMatchAnimation: () => void;
  currentCandidate: () => UserProfile | null;
}

const DEFAULT_FILTERS: SwipeFilters = {
  min_age: 18,
  max_age: 45,
  max_distance_km: 30,
  date_modes: [],
  gender: [],
  city: null,
};

export const useSwipeStore = create<SwipeState>((set, get) => ({
  candidates: [],
  currentIndex: 0,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  showMatch: false,
  matchedProfile: null,

  setCandidates: (candidates) => set({ candidates, currentIndex: 0 }),

  nextCandidate: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.candidates.length),
    })),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  setLoading: (isLoading) => set({ isLoading }),

  showMatchAnimation: (matchedProfile) =>
    set({ showMatch: true, matchedProfile }),

  hideMatchAnimation: () =>
    set({ showMatch: false, matchedProfile: null }),

  currentCandidate: () => {
    const { candidates, currentIndex } = get();
    return candidates[currentIndex] ?? null;
  },
}));
