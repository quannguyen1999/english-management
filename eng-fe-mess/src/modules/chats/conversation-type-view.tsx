import { Message } from "@/types/message";
import { FileAudio, Play } from "lucide-react";

export const renderMessageContent = (message: Message) => {
  if (message.deleted) {
    return <p className="text-gray-400 italic">This message was deleted</p>;
  }

  switch (message.type) {
    case "TEXT":
      return (
        <p className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-lg">
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
