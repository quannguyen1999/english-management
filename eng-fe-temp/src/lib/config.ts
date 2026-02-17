/**
 * Configuration constants for Talk with AI.
 */

export const CONFIG = {
  /** Silence duration (ms) before sending recorded audio to transcription */
  silenceMs: 3000,
  /** Idle duration (ms) before stopping the conversation */
  idleStopMs: 120_000, // 2 minutes
  /** Minimum audio blob size (bytes) to attempt transcription */
  minAudioSize: 500,
  /** MediaRecorder timeslice (ms) for data chunks */
  recorderTimeslice: 1000,
  /** No speech for this long (ms) → consider user silent (for "speaking" indicator) */
  userSpeakingDebounceMs: 800,
  /** Max chars before forcing TTS chunk (even without sentence end) */
  ttsChunkMaxChars: 80,
} as const;

export const TTS_WS_URL =
  process.env.NEXT_PUBLIC_TTS_WS_URL || "ws://localhost:8000/tts";

export const TTS_VOICE = "en-US-AriaNeural";

export const TTS_HTTP_FALLBACK = {
  voice: "nova" as const,
  model: "tts-1-hd" as const,
};

export function generateConversationId(): string {
  return (
    "conv_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}
