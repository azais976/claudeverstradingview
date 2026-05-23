"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;

  setUser: (user: AuthUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isOnboarded: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setOnboarded: (isOnboarded) => set({ isOnboarded }),
      reset: () => set({ user: null, profile: null, isOnboarded: false }),
    }),
    {
      name: "dr-auth",
      // Only persist non-sensitive data
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);
