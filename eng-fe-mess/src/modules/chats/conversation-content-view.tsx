"use client";

import { useConversation } from "@/components/providers/conversation-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/hooks/use-websocket";
import { renderMessageContent } from "@/modules/chats/conversation-type-view";
import { formatTimestamp } from "@/service/utils";
import { Message } from "@/types/message";
import { getCurrentUserId } from "@/utils/auth";
import EmojiPicker from "emoji-picker-react";
import { SmileIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ConversationContentView() {
  const {
    messages,
    addMessage,
    conversationId,
    loadMoreMessages,
    isLoadingMore,
    hasMoreMessages,
    isLoading,
  } = useConversation();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollableElementRef = useRef<HTMLDivElement | null>(null);
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [selectedEmojis, setSelectedEmojis] = useState<Record<string, string>>(
    {}
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isScrollingUp, setIsScrollingUp] = useState(false);

  // WebSocket integration
  const {
    subscribeToConversation,
    onMessage,
    onTyping,
    markAsRead,
    addReaction,
  } = useWebSocket();

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
    loadMoreMessages();
  }, []);

  // Find the actual scrollable element within ScrollArea
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Look for the actual scrollable element within ScrollArea
      const scrollableElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;

      if (scrollableElement) {
        scrollableElementRef.current = scrollableElement;

        // Add direct scroll listener to the actual scrollable element
        const handleDirectScroll = (e: Event) => {
          const target = e.target as HTMLDivElement;
          const { scrollTop, scrollHeight, clientHeight } = target;
          const threshold = 100;

          if (
            scrollTop <= threshold &&
            hasMoreMessages &&
            !isLoadingMore &&
            !isScrollingUp
          ) {
            setIsScrollingUp(true);

            const currentScrollTop = scrollTop;
            const currentScrollHeight = scrollHeight;

            loadMoreMessages().finally(() => {
              setIsScrollingUp(false);

              if (scrollableElementRef.current) {
                const newScrollHeight =
                  scrollableElementRef.current.scrollHeight;
                const scrollDiff = newScrollHeight - currentScrollHeight;
                scrollableElementRef.current.scrollTop =
                  currentScrollTop + scrollDiff;
              }
            });
          }
        };

        scrollableElement.addEventListener("scroll", handleDirectScroll);

        return () => {
          scrollableElement.removeEventListener("scroll", handleDirectScroll);
        };
      } else {
      }
    }
  }, [scrollAreaRef, hasMoreMessages, isLoadingMore, loadMoreMessages]);

  useEffect(() => {
    if (conversationId && currentUserId) {
      subscribeToConversation(conversationId);

      // Listen for new messages
      const unsubscribeMessage = onMessage((message) => {
        addMessage(message);

        // Mark message as read if it's not from current user
        if (message.senderId !== currentUserId && message.id) {
          markAsRead(message.id, conversationId);
        }
      });

      // Listen for typing indicators
      const unsubscribeTyping = onTyping((typing) => {
        // Handle typing indicator logic here
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

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 text-xs text-center bg-gray-100 dark:bg-gray-800">
          Loading conversation...
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading messages...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 pb-2 h-full" ref={scrollAreaRef}>
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-500">Loading more messages...</p>
            </div>
          </div>
        )}

        {hasMoreMessages && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Scroll up to load more messages
              </span>
            </div>
          </div>
        )}

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
