"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Lock, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useMessages } from "@/hooks/useMessages";
import { cn, timeAgo } from "@/lib/utils";
import type { ConversationParticipant } from "@/types";

export default function ConversationPage() {
  const params  = useParams<{ id: string }>();
  const router  = useRouter();
  const supabase = createClient();
  const { profile } = useAuthStore();
  const { messages, sendMessage } = useMessages(params.id);

  const [input, setInput]               = useState("");
  const [sending, setSending]           = useState(false);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [otherPublicKey, setOtherPublicKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadParticipants = async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("*, profile:profiles(id, display_name, public_key, profile_photos(*), last_seen, show_online)")
        .eq("conversation_id", params.id);

      if (data) {
        setParticipants(data as unknown as ConversationParticipant[]);
        const other = data.find((p) => p.user_id !== profile?.id);
        if ((other?.profile as {public_key?: string})?.public_key) {
          setOtherPublicKey((other!.profile as {public_key: string}).public_key);
        }
      }
    };
    loadParticipants();
  }, [params.id, profile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const other        = participants.find((p) => p.user_id !== profile?.id);
  const otherProfile = other?.profile as {display_name?: string; profile_photos?: {url: string; is_primary: boolean}[]; show_online?: boolean; last_seen?: string} | undefined;
  const photo        = otherProfile?.profile_photos?.find((p) => p.is_primary)?.url;
  const isOnline     = otherProfile?.show_online &&
    new Date(otherProfile.last_seen ?? 0).getTime() > Date.now() - 5 * 60 * 1000;

  const handleSend = async () => {
    if (!input.trim() || !otherPublicKey || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await sendMessage(text, otherPublicKey);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-xl flex-shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {photo
            ? <Image src={photo} alt={otherProfile?.display_name ?? ""} fill className="object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-coral/20 to-ocean/20 flex items-center justify-center text-lg">👤</div>
          }
          {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{otherProfile?.display_name ?? "Conversation"}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            {isOnline ? "En ligne · E2EE" : "Messages chiffrés E2EE"}
          </p>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted">
          <Info className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full">
            <Lock className="w-3 h-3" />
            Messages chiffrés de bout en bout
          </span>
        </div>

        {messages.map((msg) => {
          const isMine = msg.sender_id === profile?.id;
          return (
            <div key={msg.id} className={cn("flex items-end gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
              {!isMine && (
                <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex-shrink-0 mb-1">
                  {photo
                    ? <Image src={photo} alt="" width={28} height={28} className="object-cover w-full h-full" />
                    : <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                  }
                </div>
              )}
              <div className={cn("max-w-[75%] space-y-1 flex flex-col", isMine ? "items-end" : "items-start")}>
                <div className={cn("px-4 py-2.5 text-sm leading-relaxed break-words", isMine ? "msg-bubble-sent" : "msg-bubble-recv")}>
                  {msg.is_deleted
                    ? <em className="text-white/60 dark:text-muted-foreground">Message supprimé</em>
                    : msg.decrypted_content ?? (
                      <span className="flex items-center gap-1.5 text-white/70">
                        <Lock className="w-3 h-3" /> Chiffré
                      </span>
                    )
                  }
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{timeAgo(msg.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-background safe-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Message chiffré…"
              className="w-full px-4 py-3 pr-12 rounded-2xl bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
            />
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || !otherPublicKey || sending}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-coral to-volcano text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
