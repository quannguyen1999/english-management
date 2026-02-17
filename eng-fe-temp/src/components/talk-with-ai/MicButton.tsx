"use client";

type Status = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

interface MicButtonProps {
  status: Status;
  conversationId: string;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function MicButton({
  status,
  conversationId,
  onStart,
  onStop,
  disabled = false,
}: MicButtonProps) {
  const isListening = status === "listening";
  const busy =
    status === "transcribing" || status === "thinking" || status === "speaking";
  const isDisabled = disabled || busy || !conversationId;

  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  const statusLabel = isListening
    ? "Listening… Speak, then stay silent 3s to send. Silent 2 min stops the conversation. Click to stop."
    : busy
    ? "Waiting for AI…"
    : "Click mic to start real-time talk";

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl transition-all duration-200 ${
          isListening
            ? "animate-pulse bg-red-500 text-white shadow-lg shadow-red-500/40 hover:bg-red-600"
            : "bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 disabled:opacity-50"
        }`}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {isListening ? (
          <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {statusLabel}
      </span>
    </div>
  );
}
