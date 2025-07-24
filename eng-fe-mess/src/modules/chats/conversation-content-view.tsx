"use client";

import { useConversation } from "@/components/providers/conversation-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
export default function ConversationContentView() {
  const { messages } = useConversation();
  return (
    <ScrollArea className="h-full pb-2">
      {messages.map((item: any) => (
        <div
          key={item.id}
          className={`flex ${
            item.sender === "John Doe" ? "justify-end" : "justify-start"
          } space-x-2`}
        >
          <div className="flex flex-col max-w-[70%] gap-y-2">
            <p className="text-sm text-gray-500">{item.sender}</p>
            <p className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
              {item.message}
            </p>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
}
