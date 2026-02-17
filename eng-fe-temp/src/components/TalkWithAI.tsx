"use client";

import { useConversation } from "@/hooks/useConversation";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useTTS } from "@/hooks/useTTS";
import { useCallback, useState } from "react";
import { ChatLayout, ChatWindow, MicButton, StatusBar } from "./talk-with-ai";

type Status = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

export default function TalkWithAI() {
  const [error, setError] = useState<string | null>(null);

  const {
    speak,
    speakStream,
    isSpeaking,
    error: ttsError,
    clearError: clearTtsError,
    wsConnected,
    cleanupAudio,
  } = useTTS();

  const {
    messages,
    conversationId,
    sendMessage,
    startNewConversation,
    isWaitingChat,
    lastCompletedAiMessageId,
  } = useConversation({ speak, speakStream }, setError);

  const {
    startListening,
    stopListening,
    status: speechStatus,
    isListening,
    userSpeaking,
  } = useSpeechToText({
    onFinalText: sendMessage,
    conversationId,
    setError,
  });

  const status: Status = isListening
    ? "listening"
    : speechStatus === "transcribing"
    ? "transcribing"
    : isWaitingChat
    ? "thinking"
    : isSpeaking
    ? "speaking"
    : "idle";

  const busy =
    status === "transcribing" || status === "thinking" || status === "speaking";
  const displayError = error ?? ttsError;

  const handleNewConversation = useCallback(() => {
    stopListening();
    cleanupAudio();
    startNewConversation();
    setError(null);
  }, [stopListening, cleanupAudio, startNewConversation]);

  return (
    <ChatLayout
      header={
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Talk with AI Teacher
          </h1>
          <button
            type="button"
            onClick={handleNewConversation}
            disabled={busy || isListening}
            className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
          >
            New conversation
          </button>
        </div>
      }
      children={
        <ChatWindow
          messages={messages}
          status={status}
          userSpeaking={userSpeaking}
          autoTranslateMessageId={lastCompletedAiMessageId}
        />
      }
      error={
        displayError ? (
          <div className="mx-6 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {displayError}
            <button
              type="button"
              onClick={() => {
                setError(null);
                clearTtsError();
              }}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        ) : undefined
      }
      footer={
        <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <MicButton
            status={status}
            conversationId={conversationId}
            onStart={startListening}
            onStop={stopListening}
          />
          <StatusBar
            conversationId={conversationId}
            ttsConnected={wsConnected}
          />
        </div>
      }
      nav={
        <nav className="border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <div className="flex gap-6 text-sm">
            <a
              href="/"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              ← Speech to Text
            </a>
            <a
              href="/text-to-speech"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Text to Speech →
            </a>
          </div>
        </nav>
      }
    />
  );
}
