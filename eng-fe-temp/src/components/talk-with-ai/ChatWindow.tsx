"use client";

import type { Message } from "@/lib/api";
import { translateToVietnamese } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

interface ChatWindowProps {
  messages: Message[];
  status: Status;
  userSpeaking?: boolean;
  emptyMessage?: string;
  /** When set, auto-translate this message (e.g. when AI streaming completes) */
  autoTranslateMessageId?: string | null;
}

export function ChatWindow({
  messages,
  status,
  userSpeaking = false,
  emptyMessage = "Click the mic to start. Speak; after 3 seconds of silence your message is sent to the AI and the reply is read aloud. We keep waiting for you; if you stay silent for 2 minutes, the conversation stops.",
  autoTranslateMessageId = null,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [translatedByMessageId, setTranslatedByMessageId] = useState<
    Record<string, string>
  >({});
  const [translatingMessageId, setTranslatingMessageId] = useState<
    string | null
  >(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const handleTranslate = useCallback(
    async (messageId: string, content: string) => {
      if (!content.trim()) return;
      setTranslateError(null);
      setTranslatingMessageId(messageId);
      try {
        const translated = await translateToVietnamese(content);
        setTranslatedByMessageId((prev) => ({
          ...prev,
          [messageId]: translated,
        }));
      } catch (err) {
        setTranslateError(
          err instanceof Error ? err.message : "Translation failed"
        );
      } finally {
        setTranslatingMessageId(null);
      }
    },
    []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-translate when streaming completes (stream-like UX: English first, then Vietnamese)
  useEffect(() => {
    if (
      !autoTranslateMessageId ||
      translatedByMessageId[autoTranslateMessageId] ||
      translatingMessageId
    )
      return;
    const msg = messages.find((m) => m.id === autoTranslateMessageId);
    if (msg?.content?.trim()) {
      handleTranslate(autoTranslateMessageId, msg.content);
    }
  }, [
    autoTranslateMessageId,
    messages,
    translatedByMessageId,
    translatingMessageId,
    handleTranslate,
  ]);

  const showEmpty =
    messages.length === 0 && status !== "transcribing" && status !== "thinking";

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {showEmpty && (
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      )}
      {translateError && (
        <p className="mb-2 text-center text-sm text-red-600 dark:text-red-400">
          {translateError}
        </p>
      )}
      <div className="flex flex-col gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`flex max-w-[85%] flex-col gap-2 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                <p className="text-sm font-medium whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {translatedByMessageId[msg.id] ? (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Tiếng Việt:
                    </span>
                    <p className="mt-1 whitespace-pre-wrap">
                      {translatedByMessageId[msg.id]}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTranslate(msg.id, msg.content)}
                    disabled={
                      !msg.content.trim() || translatingMessageId === msg.id
                    }
                    className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50 dark:text-emerald-400"
                  >
                    {translatingMessageId === msg.id
                      ? "Đang dịch…"
                      : "Dịch sang tiếng Việt"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {userSpeaking && (
          <div className="flex justify-end">
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="32"
                  strokeDashoffset="12"
                />
              </svg>
              Listening…
            </div>
          </div>
        )}
        {status === "transcribing" && (
          <div className="flex justify-end">
            <div className="rounded-2xl bg-zinc-200 px-4 py-2.5 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              Transcribing…
            </div>
          </div>
        )}
        {status === "thinking" && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-200 px-4 py-2.5 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              AI is thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
