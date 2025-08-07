"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Message } from "@/types/message";

interface ConversationContextProps {
  messages: Message[];
  refresh: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
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
      const response = await fetch(`/api/conversation/${id}?page=0&size=20`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.reverse()); // Reverse to show newest first
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
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
        const response = await fetch('/api/conversation/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, message }),
        });
        
        if (response.ok) {
          const newMessage = await response.json();
          setMessages(prev => [...prev, newMessage]);
        } else {
          setError('Failed to send message');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [id]
  );

  return (
    <ConversationContext.Provider
      value={{ messages, refresh: fetchMessages, sendMessage, isLoading, error }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
