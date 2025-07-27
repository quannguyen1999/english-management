"use client";

import { useConversation } from "@/components/providers/conversation-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker from "emoji-picker-react";
import { SmileIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ConversationContentView() {
  const { messages } = useConversation();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [selectedEmojis, setSelectedEmojis] = useState<Record<string, string>>(
    {}
  );

  const handleEmojiClick = (emojiData: any, id: string) => {
    setSelectedEmojis((prev) => ({ ...prev, [id]: emojiData.emoji }));
    setActivePickerId(null);
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="h-full pb-2">
      {messages.map((item: any) => (
        <div
          key={item.id}
          className={`flex ${
            item.sender === "John Doe" ? "justify-end" : "justify-start"
          } space-x-2`}
        >
          <div className="flex flex-col max-w-[70%] gap-y-2 relative">
            <p className="text-sm text-gray-500">{item.sender}</p>
            <p className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
              {item.message}
            </p>

            <DropdownMenu
              open={activePickerId === item.id}
              onOpenChange={(isOpen) =>
                setActivePickerId(isOpen ? item.id : null)
              }
            >
              <DropdownMenuTrigger asChild>
                <div
                  className={
                    item.sender === "John Doe"
                      ? "absolute -bottom-3 -left-3 text-2xl"
                      : "absolute -bottom-3 -right-3 text-2xl"
                  }
                >
                  {selectedEmojis[item.id] ? (
                    <span className="text-2xl cursor-pointer">
                      {selectedEmojis[item.id]}
                    </span>
                  ) : (
                    <SmileIcon className="size-6 cursor-pointer" />
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-transparent border-none">
                <EmojiPicker
                  onEmojiClick={(emoji) => handleEmojiClick(emoji, item.id)}
                  reactionsDefaultOpen={true}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      <div ref={endOfMessagesRef} />
    </ScrollArea>
  );
}
