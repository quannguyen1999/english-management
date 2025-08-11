"use client";

import { getMessages, sendMessages } from "@/service/api-messages";
import { Message, MessageResponsePage } from "@/types/message";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ConversationContextProps {
  messages: Message[];
  conversationId: string;
  refresh: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: Message) => void;
  isLoading: boolean;
  error: string | null;
}

const ConversationContext = createContext<ConversationContextProps | undefined>(
  undefined
);

export function useConversation() {
  const ctx = useContext(ConversationContext);
  if (!ctx)
    throw new Error(
      "useConversation must be used within a ConversationProvider"
    );
  return ctx;
}

interface ConversationProviderProps {
  id: string;
  children: React.ReactNode;
}

export function ConversationProvider({
  id,
  children,
}: ConversationProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getMessages(id, 0, 20);
      if (response.status === 200) {
        const data = response.data as MessageResponsePage;
        setMessages(data.data.reverse());
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!id) return;

      try {
        const response = await sendMessages({
          conversationId: id,
          content: message,
          type: "TEXT",
        });

        if (response.status === 200) {
          // Don't add message here - wait for WebSocket confirmation
          // This prevents duplicate messages from appearing
          console.log(
            "Message sent successfully, waiting for WebSocket confirmation"
          );
        } else {
          setError("Failed to send message");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      }
    },
    [id]
  );

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Check if message already exists to prevent duplicates
      if (message.id && prev.some((existing) => existing.id === message.id)) {
        return prev; // Return existing array if message already exists
      }
      return [...prev, message];
    });
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        messages,
        conversationId: id,
        refresh: fetchMessages,
        sendMessage,
        addMessage,
        isLoading,
        error,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
