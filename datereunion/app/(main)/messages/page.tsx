"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Search, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { timeAgo } from "@/lib/utils";
import type { Conversation } from "@/types";

export default function MessagesPage() {
  const supabase = createClient();
  const { profile } = useAuthStore();
  const { conversations, setConversations } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!profile) return;
    fetchConversations();

    const channel = supabase
      .channel("conversations-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchConversations)
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(
          *,
          profile:profiles(id, display_name, profile_photos(*), last_seen, show_online)
        ),
        last_message:messages(id, encrypted_content, created_at, sender_id)
      `)
      .order("updated_at", { ascending: false });

    if (data) setConversations(data as unknown as Conversation[]);
    setLoading(false);
  };

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const other = c.participants?.find((p) => p.user_id !== profile?.id)?.profile;
    return (other as {display_name?: string})?.display_name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-6 h-6 text-coral" />
        <h1 className="text-2xl font-extrabold">Messages</h1>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          <Lock className="w-3 h-3" /> E2EE
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chercher une conversation…"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl">💬</div>
          <h3 className="font-bold text-xl">Aucun message</h3>
          <p className="text-muted-foreground text-sm">Commence par matcher avec quelqu&apos;un !</p>
          <Link href="/swipe" className="inline-block px-6 py-3 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl hover:opacity-90 mt-2">
            Découvrir
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((conv) => {
            const other  = conv.participants?.find((p) => p.user_id !== profile?.id)?.profile;
            const photo  = (other as {profile_photos?: {url: string; is_primary: boolean}[]})?.profile_photos?.find((p) => p.is_primary)?.url
                        ?? (other as {profile_photos?: {url: string}[]})?.profile_photos?.[0]?.url;
            const isOnline = (other as {show_online?: boolean})?.show_online &&
              new Date((other as {last_seen: string}).last_seen).getTime() > Date.now() - 5 * 60 * 1000;
            const isGroup = conv.type === "group";

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition-colors"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                  {isGroup
                    ? <div className="w-full h-full bg-gradient-to-br from-coral/20 to-ocean/20 flex items-center justify-center text-2xl">👥</div>
                    : photo
                      ? <Image src={photo} alt={(other as {display_name?: string})?.display_name ?? ""} fill className="object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-coral/20 to-ocean/20 flex items-center justify-center text-2xl">👤</div>
                  }
                  {isOnline && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold truncate">
                      {isGroup ? conv.name : (other as {display_name?: string})?.display_name}
                    </p>
                    {conv.last_message && (
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {timeAgo((conv.last_message as {created_at: string}).created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                    Message chiffré
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
