"use client";

import type { Message } from "@/lib/api";
import {
  loadConversation as loadConversationApi,
  sendChatMessageStream,
} from "@/lib/api";
import { generateConversationId } from "@/lib/config";
import { useCallback, useEffect, useState } from "react";

export function useConversation(
  speakOrStream: {
    speak: (text: string, onEnd?: () => void) => Promise<void>;
    speakStream: (
      onAllDone?: () => void
    ) => import("@/hooks/useTTS").SpeakStreamController;
  },
  setError: (err: string | null) => void
) {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isWaitingChat, setIsWaitingChat] = useState(false);
  const [lastCompletedAiMessageId, setLastCompletedAiMessageId] = useState<
    string | null
  >(null);

  const loadConversation = useCallback(async (convId: string) => {
    if (!convId) return;
    try {
      const data = await loadConversationApi(convId);
      if (data?.messages?.length) {
        setMessages(
          data.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setConversationId(generateConversationId());
  }, []);

  useEffect(() => {
    loadConversation(conversationId);
  }, [conversationId, loadConversation]);

  const sendMessage = useCallback(
    async (userText: string, onAfterSpeak?: () => void) => {
      if (!userText.trim() || !conversationId) return;

      setError(null);
      setIsWaitingChat(true);

      const userMessage: Message = {
        id: "local_user_" + Date.now(),
        role: "user",
        content: userText.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const aiMessageId = "local_ai_" + Date.now();
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      const stream = speakOrStream.speakStream(onAfterSpeak);

      try {
        await sendChatMessageStream(
          {
            conversation_id: conversationId,
            message: userText.trim(),
            max_tokens: 1000,
            temperature: 0.5,
          },
          {
            onChunk: (chunk) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: m.content + chunk }
                    : m
                )
              );
              stream.append(chunk);
            },
            onDone: (data) => {
              const finalId = data.ai_message_id || aiMessageId;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessageId ? { ...m, id: finalId } : m
                )
              );
              setLastCompletedAiMessageId(finalId);
              stream.end();
            },
            onError: (err) => {
              setError(err);
              setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
              stream.abort();
            },
          }
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat request failed");
        setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
        onAfterSpeak?.();
      } finally {
        setIsWaitingChat(false);
      }
    },
    [conversationId, speakOrStream]
  );

  const startNewConversation = useCallback(() => {
    setConversationId(generateConversationId());
    setMessages([]);
    setLastCompletedAiMessageId(null);
    setError(null);
  }, []);

  return {
    messages,
    conversationId,
    sendMessage,
    startNewConversation,
    isWaitingChat,
    lastCompletedAiMessageId,
  };
}
