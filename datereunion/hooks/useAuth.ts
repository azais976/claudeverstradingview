"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { initializeE2EE, clearKeyPair } from "@/lib/encryption";
import type { UserProfile } from "@/types";

export function useAuth() {
  const supabase = createClient();
  const router = useRouter();
  const { user, profile, isLoading, setUser, setProfile, setLoading, reset } =
    useAuthStore();

  // Fetch current user's profile
  const fetchProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, profile_photos(*)")
        .eq("user_id", userId)
        .single();

      if (error || !data) return null;
      return data as unknown as UserProfile;
    },
    [supabase]
  );

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          phone: supabaseUser.phone ?? null,
        });
        const p = await fetchProfile(supabaseUser.id);
        setProfile(p);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          phone: session.user.phone ?? null,
        });
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else if (event === "SIGNED_OUT") {
        reset();
        await clearKeyPair();
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    await supabase.auth.signOut();
    await clearKeyPair();
    reset();
    router.push("/");
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      return;
    }
    setProfile(data as unknown as UserProfile);
  };

  return { user, profile, isLoading, signOut, updateProfile, fetchProfile };
}
