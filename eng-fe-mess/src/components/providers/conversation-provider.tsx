"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ConversationContextProps {
  messages: any[];
  refresh: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
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
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = useCallback(async () => {
    const response = await fetch(`/api/conversation/${id}`);
    const data = await response.json();
    setMessages(data);
  }, [id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (message: string) => {
      const data = await fetch(`/api/conversation/send`, {
        method: "POST",
        body: JSON.stringify({ id, message }),
      });
      const newMessage = await data.json();
      setMessages([...messages, newMessage]);
    },
    [id, messages]
  );

  return (
    <ConversationContext.Provider
      value={{ messages, refresh: fetchMessages, sendMessage }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
