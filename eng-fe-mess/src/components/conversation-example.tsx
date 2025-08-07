"use client";

import React, { useState } from "react";
import { ConversationProvider, useConversation } from "./providers/conversation-provider";

// Example conversation component
function ConversationContent() {
  const { messages, sendMessage, isLoading, error } = useConversation();
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      setNewMessage("");
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading messages...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="bg-blue-100 p-2 rounded-lg max-w-xs"
            >
              <div className="text-sm font-medium">{message.senderId}</div>
              <div>{message.content}</div>
              <div className="text-xs text-gray-500">
                {message.createdAt && new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// Example usage component
export function ConversationExample() {
  const [conversationId, setConversationId] = useState("");

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Conversation Example</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Conversation ID:
        </label>
        <input
          type="text"
          value={conversationId}
          onChange={(e) => setConversationId(e.target.value)}
          placeholder="Enter conversation ID"
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {conversationId && (
        <ConversationProvider id={conversationId}>
          <ConversationContent />
        </ConversationProvider>
      )}
    </div>
  );
} 