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
  loadMoreMessages: () => Promise<void>;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMoreMessages: boolean;
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [totalMessages, setTotalMessages] = useState(0);

  const fetchMessages = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getMessages(id, 0, 20);
      if (response.status === 200) {
        const data = response.data as MessageResponsePage;
        setMessages(data.data.reverse());
        setTotalMessages(data.total);
        setCurrentPage(0);
        setHasMoreMessages(data.data.length === 20 && data.total > 20);
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadMoreMessages = useCallback(async () => {
    if (!id || isLoadingMore || !hasMoreMessages) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await getMessages(id, nextPage, 20);
      if (response.status === 200) {
        const data = response.data as MessageResponsePage;
        if (data.data.length > 0) {
          setMessages((prev) => {
            // Filter out any messages that already exist to prevent duplicates
            const newMessages = data.data.filter(
              (newMsg) => !prev.some((existing) => existing.id === newMsg.id)
            );

            // If no new unique messages, don't update
            if (newMessages.length === 0) {
              return prev;
            }

            return [...newMessages.reverse(), ...prev];
          });
          setCurrentPage(nextPage);
          setHasMoreMessages(
            data.data.length === 20 && (nextPage + 1) * 20 < data.total
          );
        } else {
          setHasMoreMessages(false);
        }
      } else {
        setError("Failed to load more messages");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more messages"
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [id, currentPage, isLoadingMore, hasMoreMessages]);

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

      // If no ID, generate a temporary unique ID to prevent duplicate key errors
      if (!message.id) {
        message = {
          ...message,
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
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
        loadMoreMessages,
        isLoading,
        isLoadingMore,
        error,
        hasMoreMessages,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
