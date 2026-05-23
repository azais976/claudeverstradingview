"use client";

import { create } from "zustand";
import type { Conversation, Message } from "@/types";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // keyed by conversation_id
  unreadCounts: Record<string, number>;

  setConversations: (convs: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  markAsRead: (conversationId: string) => void;
  updateConversationLastMessage: (conversationId: string, message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCounts: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          message,
        ],
      },
    })),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  markAsRead: (conversationId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    })),

  updateConversationLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, last_message: message } : c
      ),
    })),
}));
