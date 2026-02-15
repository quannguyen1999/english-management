"use client";

import { float32ToWavBlob } from "@/lib/float32ToWav";
import { MicVAD } from "@ricky0123/vad-web";
import { useCallback, useEffect, useRef, useState } from "react";

// CDN paths for VAD assets (no need to copy silero ONNX / worklet into public)
const ONNX_WASM_BASE =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.1/dist/";
const VAD_ASSET_BASE =
  "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.30/dist/";

export default function SpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [vadLoading, setVadLoading] = useState(false);

  const vadRef = useRef<MicVAD | null>(null);

  const transcribeWithWhisper = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) return;
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      if (data.text?.trim()) {
        setTranscript((prev) => (prev ? `${prev} ${data.text}` : data.text));
      }
    } catch (err) {
      console.error("[Whisper]", err);
      setError(
        err instanceof Error ? err.message : "Whisper transcription failed"
      );
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript("");
    setVadLoading(true);

    try {
      const vad = await MicVAD.new({
        onSpeechStart: () => setUserSpeaking(true),
        onSpeechEnd: async (audio: Float32Array) => {
          setUserSpeaking(false);
          const wavBlob = float32ToWavBlob(audio);
          await transcribeWithWhisper(wavBlob);
        },
        onVADMisfire: () => setUserSpeaking(false),
        positiveSpeechThreshold: 0.5,
        negativeSpeechThreshold: 0.35,
        redemptionMs: 800,
        preSpeechPadMs: 300,
        minSpeechMs: 400,
        onnxWASMBasePath: ONNX_WASM_BASE,
        baseAssetPath: VAD_ASSET_BASE,
      });

      vadRef.current = vad;
      await vad.start();
      setIsListening(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start voice detection";
      setError(message);
    } finally {
      setVadLoading(false);
    }
  }, [transcribeWithWhisper]);

  const stopListening = useCallback(async () => {
    const vad = vadRef.current;
    if (vad) {
      await vad.pause();
      await vad.destroy();
      vadRef.current = null;
    }
    setUserSpeaking(false);
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      vadRef.current?.pause().then(() => vadRef.current?.destroy());
      vadRef.current = null;
    };
  }, []);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Real-Time Speech to Text
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Powered by Silero VAD (voice activity detection) + OpenAI Whisper. Speak
        in segments; each time you stop speaking, the segment is sent to
        Whisper.
      </p>

      {/* Mic Button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={toggleListening}
          disabled={vadLoading}
          className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl transition-all duration-200 ${
            vadLoading
              ? "cursor-wait bg-zinc-300 text-zinc-500 dark:bg-zinc-600"
              : isListening
              ? "animate-pulse bg-red-500 text-white shadow-lg shadow-red-500/40 hover:bg-red-600"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {vadLoading ? (
            <span className="text-lg">…</span>
          ) : isListening ? (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {vadLoading
            ? "Loading voice detection…"
            : isListening
            ? userSpeaking
              ? "Speaking…"
              : "Listening... Click to stop"
            : "Click to start"}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transcript */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Transcript{" "}
          {isTranscribing && <span className="text-amber-500">(Whisper…)</span>}
        </h2>
        <div className="min-h-[120px] rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
          {transcript ? (
            <p className="text-zinc-900 dark:text-zinc-100">{transcript}</p>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-500">
              Speak and pause; each segment will be transcribed here via OpenAI
              Whisper.
            </p>
          )}
        </div>
      </div>

      <nav className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div className="flex gap-6 text-sm">
          <a
            href="/talk-with-ai"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Talk with AI →
          </a>
          <a
            href="/text-to-speech"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Text to Speech →
          </a>
        </div>
      </nav>
    </div>
  );
}
