"use client";

interface StatusBarProps {
  conversationId: string;
  ttsConnected: boolean;
}

export function StatusBar({ conversationId, ttsConnected }: StatusBarProps) {
  return (
    <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
      Conversation: {conversationId || "—"}
      <span
        className={`ml-2 inline-flex items-center gap-1 ${
          ttsConnected ? "text-emerald-600 dark:text-emerald-400" : ""
        }`}
        title={
          ttsConnected ? "TTS connected" : "TTS connecting or disconnected"
        }
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            ttsConnected ? "bg-emerald-500" : "bg-zinc-400"
          }`}
        />
        {ttsConnected ? "TTS ready" : "TTS…"}
      </span>
    </p>
  );
}
