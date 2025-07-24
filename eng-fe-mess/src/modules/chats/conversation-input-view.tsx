"use client";

import { useConversation } from "@/components/providers/conversation-provider";
import { Input } from "@/components/ui/input";
import { MicIcon, SendIcon, SmileIcon } from "lucide-react";
import { useState } from "react";

export default function ConversationInputView() {
  const [message, setMessage] = useState("");
  const { sendMessage } = useConversation();

  const handleSend = async () => {
    if (message.trim() === "") return;
    await sendMessage(message);
    setMessage("");
  };

  return (
    <div className="w-full border-t-2 flex flex-row gap-x-2">
      <Input
        placeholder="Type a message"
        className="w-full h-[50px] border-none cursor-pointer"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="flex flex-row gap-x-4 items-center">
        <SmileIcon className="size-6 cursor-pointer" />
        <SendIcon
          className="size-6 cursor-pointer"
          onClick={() => handleSend()}
        />
        <MicIcon className="size-6 cursor-pointer" />
      </div>
    </div>
  );
}
