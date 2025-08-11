"use client";

import { useConversation } from "@/components/providers/conversation-provider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import EmojiPicker from "emoji-picker-react";
import { MicIcon, SendIcon, SmileIcon } from "lucide-react";
import { useState } from "react";

export default function ConversationInputView() {
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");

  const handleEmojiClick = (emojiData: any) => {
    setSelectedEmoji(emojiData.emoji);
    setShowPicker(false);
    setMessage(message + emojiData.emoji);
    setSelectedEmoji("");
  };
  const { sendMessage } = useConversation();

  const handleSend = async () => {
    if (message.trim() === "") return;
    await sendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full border-t-2 flex flex-row gap-x-2">
      <Input
        placeholder="Type a message"
        className="w-full h-[50px] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="flex flex-row gap-x-4 items-center">
        <DropdownMenu open={showPicker} onOpenChange={setShowPicker}>
          <DropdownMenuTrigger>
            <SmileIcon className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              allowExpandReactions
              reactionsDefaultOpen={true}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <SendIcon
          className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => handleSend()}
        />
        <MicIcon className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
      </div>
    </div>
  );
}
