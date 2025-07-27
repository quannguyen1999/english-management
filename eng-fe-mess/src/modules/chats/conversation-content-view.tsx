"use client";

import { useConversation } from "@/components/providers/conversation-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SmileIcon } from "lucide-react";
import { useEffect, useRef } from "react";
export default function ConversationContentView() {
  const { messages } = useConversation();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

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

            <Button
              className={
                item.sender === "John Doe"
                  ? "absolute -bottom-4 -left-4 text-2xl"
                  : "absolute -bottom-4 -right-4 text-2xl"
              }
              variant="icon"
            >
              <SmileIcon />
            </Button>
          </div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </ScrollArea>
  );
}
