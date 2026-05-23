"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { timeAgo, getAge } from "@/lib/utils";
import type { Match } from "@/types";

export default function MatchesPage() {
  const supabase = createClient();
  const { profile } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchMatches = async () => {
      const { data } = await supabase
        .from("matches")
        .select(`
          *,
          user1:profiles!matches_user1_id_fkey(*, profile_photos(*)),
          user2:profiles!matches_user2_id_fkey(*, profile_photos(*))
        `)
        .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
        .eq("is_active", true)
        .order("matched_at", { ascending: false });

      if (data) {
        const mapped = data.map((m: Record<string, unknown>) => ({
          ...m,
          matched_profile: m.user1_id === profile.id ? m.user2 : m.user1,
        })) as unknown as Match[];
        setMatches(mapped);
      }
      setLoading(false);
    };

    fetchMatches();
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-coral fill-coral" />
        <h1 className="text-2xl font-extrabold">Mes Matches</h1>
        {matches.length > 0 && (
          <span className="ml-auto bg-coral/10 text-coral text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {matches.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl">💔</div>
          <h3 className="font-bold text-xl">Pas encore de match</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Continue à swiper pour trouver tes premiers matches !
          </p>
          <Link
            href="/swipe"
            className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Découvrir des profils
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* New matches row */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Nouveaux matches</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {matches.slice(0, 10).map((match) => {
                const p = match.matched_profile;
                if (!p) return null;
                const photo = p.photos?.find((ph) => ph.is_primary)?.url ?? p.photos?.[0]?.url;
                return (
                  <Link
                    key={match.id}
                    href={`/messages/${match.conversation_id}`}
                    className="flex-shrink-0 text-center"
                  >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-coral mx-auto">
                      {photo ? (
                        <Image src={photo} alt={p.display_name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-coral/20 to-ocean/20 flex items-center justify-center text-2xl">👤</div>
                      )}
                    </div>
                    <p className="text-xs font-medium mt-1.5 truncate max-w-[72px]">{p.display_name}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* All matches list */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 mt-6">Tous les matches</h2>
            <div className="space-y-2">
              {matches.map((match) => {
                const p = match.matched_profile;
                if (!p) return null;
                const photo = p.photos?.find((ph) => ph.is_primary)?.url ?? p.photos?.[0]?.url;
                const age = getAge(p.birth_date);
                return (
                  <Link
                    key={match.id}
                    href={`/messages/${match.conversation_id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                      {photo ? (
                        <Image src={photo} alt={p.display_name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-coral/20 to-ocean/20 flex items-center justify-center text-xl">👤</div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{p.display_name}, {age}</p>
                      <p className="text-sm text-muted-foreground truncate">{p.city}</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs">{timeAgo(match.matched_at)}</span>
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
