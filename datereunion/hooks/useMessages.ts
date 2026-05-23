"use client";

import { useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import {
  encryptMessage,
  decryptMessage,
  getPrivateKey,
} from "@/lib/encryption";
import type { Message, EncryptedPayload } from "@/types";

export function useMessages(conversationId: string) {
  const supabase = createClient();
  const { profile } = useAuthStore();
  const {
    messages,
    setMessages,
    addMessage,
    markAsRead,
    updateConversationLastMessage,
  } = useChatStore();

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const conversationMessages = messages[conversationId] || [];

  // Decrypt a single message
  const decryptMsg = useCallback(
    async (msg: Message): Promise<Message> => {
      try {
        const privateKey = await getPrivateKey();
        if (!privateKey || !msg.ephemeral_public_key) return msg;

        const payload: EncryptedPayload = {
          ciphertext: msg.encrypted_content,
          iv: msg.iv,
          ephemeralPublicKey: msg.ephemeral_public_key,
        };

        const decrypted = decryptMessage(payload, privateKey);
        return { ...msg, decrypted_content: decrypted };
      } catch {
        return { ...msg, decrypted_content: "[Message chiffré]" };
      }
    },
    []
  );

  // Load message history
  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:profiles(id, display_name, public_key, profile_photos(url, is_primary))")
      .eq("conversation_id", conversationId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error || !data) return;

    // Decrypt all messages
    const decrypted = await Promise.all(data.map(decryptMsg));
    setMessages(conversationId, decrypted as Message[]);
    markAsRead(conversationId);

    // Update last_read_at in DB
    if (profile) {
      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", profile.id);
    }
  }, [conversationId, supabase, decryptMsg, setMessages, markAsRead, profile]);

  // Send a message with E2EE
  const sendMessage = useCallback(
    async (plaintext: string, recipientPublicKey: string) => {
      if (!profile || !plaintext.trim()) return;

      try {
        // Encrypt the message
        const payload = encryptMessage(plaintext, recipientPublicKey);

        const { data, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: profile.id,
            encrypted_content: payload.ciphertext,
            iv: payload.iv,
            ephemeral_public_key: payload.ephemeralPublicKey,
            message_type: "text",
          })
          .select("*, sender:profiles(id, display_name, public_key, profile_photos(url, is_primary))")
          .single();

        if (error) throw error;

        const decryptedMsg: Message = {
          ...(data as unknown as Message),
          decrypted_content: plaintext, // We know what we sent
        };

        addMessage(conversationId, decryptedMsg);
        updateConversationLastMessage(conversationId, decryptedMsg);
      } catch (err) {
        console.error("Send message error:", err);
      }
    },
    [profile, conversationId, supabase, addMessage, updateConversationLastMessage]
  );

  // Subscribe to realtime messages
  useEffect(() => {
    loadMessages();

    channelRef.current = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          // Don't add our own messages (already added optimistically)
          if (newMsg.sender_id === profile?.id) return;
          const decrypted = await decryptMsg(newMsg);
          addMessage(conversationId, decrypted);
          updateConversationLastMessage(conversationId, decrypted);
        }
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    messages: conversationMessages,
    sendMessage,
    loadMessages,
  };
}
