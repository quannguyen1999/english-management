"use client";

import { useConversation } from "@/components/providers/conversation-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/hooks/use-websocket";
import { Message } from "@/types/message";
import { getCurrentUserId } from "@/utils/auth";
import EmojiPicker from "emoji-picker-react";
import { FileAudio, Play, SmileIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ConversationContentView() {
  const { messages, addMessage, conversationId } = useConversation();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [selectedEmojis, setSelectedEmojis] = useState<Record<string, string>>(
    {}
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // WebSocket integration
  const {
    subscribeToConversation,
    onMessage,
    onTyping,
    markAsRead,
    addReaction,
    getConnectionStatus,
  } = useWebSocket();

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  // Subscribe to conversation when component mounts or conversationId changes
  useEffect(() => {
    if (conversationId && currentUserId) {
      // Subscribe to conversation (will be queued if not connected)
      subscribeToConversation(conversationId);

      // Listen for new messages
      const unsubscribeMessage = onMessage((message) => {
        console.log("WebSocket received message:", message.id, message.content);
        addMessage(message);

        // Mark message as read if it's not from current user
        if (message.senderId !== currentUserId && message.id) {
          markAsRead(message.id, conversationId);
        }
      });

      // Listen for typing indicators
      const unsubscribeTyping = onTyping((typing) => {
        // Handle typing indicator logic here
        console.log("User typing:", typing);
      });

      // Cleanup subscriptions
      return () => {
        unsubscribeMessage();
        unsubscribeTyping();
      };
    }
  }, [
    conversationId,
    currentUserId,
    subscribeToConversation,
    onMessage,
    onTyping,
    addMessage,
    markAsRead,
  ]);

  const handleEmojiClick = (emojiData: any, id: string) => {
    if (id && conversationId) {
      // Add reaction via WebSocket
      addReaction(id, conversationId, emojiData.emoji);

      // Update local state
      setSelectedEmojis((prev) => ({ ...prev, [id]: emojiData.emoji }));
      setActivePickerId(null);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.deleted) {
      return <p className="text-gray-400 italic">This message was deleted</p>;
    }

    switch (message.type) {
      case "TEXT":
        return (
          <p className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
            {message.content}
            {message.edited && (
              <span className="text-xs text-gray-500 ml-2">(edited)</span>
            )}
          </p>
        );
      case "AUDIO":
        return (
          <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg flex items-center gap-2">
            <Play className="size-4 text-blue-500" />
            <span className="text-sm">Audio message</span>
            <FileAudio className="size-4 text-gray-500" />
          </div>
        );
      case "IMAGE":
        return (
          <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
            <img
              src={message.content}
              alt="Image"
              className="max-w-full h-auto rounded"
            />
          </div>
        );
      case "VIDEO":
        return (
          <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
            <video
              src={message.content}
              controls
              className="max-w-full h-auto rounded"
            />
          </div>
        );
      case "FILE":
        return (
          <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg flex items-center gap-2">
            <FileAudio className="size-4 text-blue-500" />
            <span className="text-sm">
              File: {message.content?.split("/").pop()}
            </span>
          </div>
        );
      default:
        return (
          <p className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
            {message.content}
          </p>
        );
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  const connectionStatus = getConnectionStatus();

  return (
    <div className="h-full flex flex-col">
      {/* Connection status indicator */}
      <div
        className={`px-4 py-2 text-xs text-center ${
          connectionStatus
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {connectionStatus ? "🟢 Connected" : "🔴 Disconnected"}
      </div>

      <ScrollArea className="flex-1 pb-2 h-full">
        {messages.map((item: Message) => {
          const isCurrentUser = item.senderId === currentUserId;
          return (
            <div
              key={item.id}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              } space-x-2 mb-4`}
            >
              <div className="flex flex-col max-w-[70%] gap-y-2 relative">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    {isCurrentUser
                      ? "You"
                      : `User ${item.senderId?.slice(0, 8)}`}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(item.createdAt ?? 0)}
                  </span>
                </div>

                {renderMessageContent(item)}

                <DropdownMenu
                  open={activePickerId === item.id}
                  onOpenChange={(isOpen) =>
                    setActivePickerId(isOpen ? item.id ?? "" : null)
                  }
                >
                  <DropdownMenuTrigger asChild>
                    <div
                      className={
                        isCurrentUser
                          ? "absolute -bottom-3 -left-3 text-2xl"
                          : "absolute -bottom-3 -right-3 text-2xl"
                      }
                    >
                      {selectedEmojis[item.id ?? ""] ? (
                        <span className="text-2xl cursor-pointer">
                          {selectedEmojis[item.id ?? ""]}
                        </span>
                      ) : (
                        <SmileIcon className="size-6 cursor-pointer" />
                      )}
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="bg-transparent border-none">
                    <EmojiPicker
                      onEmojiClick={(emoji) =>
                        handleEmojiClick(emoji, item.id ?? "")
                      }
                      reactionsDefaultOpen={true}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}

        <div ref={endOfMessagesRef} />
      </ScrollArea>
    </div>
  );
}
