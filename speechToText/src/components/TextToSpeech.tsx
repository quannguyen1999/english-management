"use client";

import RealtimeTTS from "@/app/components/RealtimeTTS";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TEXT =
  "わたしは学生です。まいにち学校へ行きます。朝は六時に起きます。起きてから、顔をあらって、朝ごはんを食べます。朝ごはんはパンとたまごを食べることが多いです。ごはんのあとで、学校へ行きます";

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
type Model = "tts-1" | "tts-1-hd";
type TTSMode = "free" | "premium";

export default function TextToSpeech() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<TTSMode>("free");
  const [voice, setVoice] = useState<Voice>("nova");
  const [model, setModel] = useState<Model>("tts-1-hd");
  const [lang, setLang] = useState("ja-JP");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakFree = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      setError(`Speech error: ${e.error}`);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [text, lang]);

  const speakPremium = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setIsLoading(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, voice, model }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate speech");
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoading(false);
      };
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        setError("Failed to play audio");
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Speech generation failed");
    }
  }, [text, voice, model]);

  const speak = useCallback(() => {
    if (mode === "free") {
      speakFree();
    } else {
      speakPremium();
    }
  }, [mode, speakFree, speakPremium]);

  const stop = useCallback(() => {
    if (mode === "free") {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      utteranceRef.current = null;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
      }
    }
  }, [mode]);

  useEffect(() => {
    const loadVoices = () => speechSynthesis.getVoices();
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Text to Speech
      </h1>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="tts-text"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Enter text
        </label>
        <textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Enter text to speak..."
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            TTS Mode:
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="tts-mode"
                value="free"
                checked={mode === "free"}
                onChange={(e) => {
                  stop();
                  setMode(e.target.value as TTSMode);
                }}
                disabled={isSpeaking || isLoading}
                className="h-4 w-4"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Free (Browser) - No cost
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="tts-mode"
                value="premium"
                checked={mode === "premium"}
                onChange={(e) => {
                  stop();
                  setMode(e.target.value as TTSMode);
                }}
                disabled={isSpeaking || isLoading}
                className="h-4 w-4"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Premium (OpenAI) - Costs API credits
              </span>
            </label>
          </div>
        </div>

        {mode === "free" ? (
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Language:
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              disabled={isSpeaking || isLoading}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value="ja-JP">Japanese (日本語)</option>
              <option value="vi-VN">Vietnamese (Tiếng Việt)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="ko-KR">Korean</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Voice:
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value as Voice)}
              disabled={isSpeaking || isLoading}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value="nova">Nova (Female, Natural)</option>
              <option value="alloy">Alloy (Neutral)</option>
              <option value="echo">Echo (Male)</option>
              <option value="fable">Fable (Male, British)</option>
              <option value="onyx">Onyx (Male, Deep)</option>
              <option value="shimmer">Shimmer (Female, Soft)</option>
            </select>

            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Quality:
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as Model)}
              disabled={isSpeaking || isLoading}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value="tts-1-hd">HD (Best Quality)</option>
              <option value="tts-1">Standard (Faster)</option>
            </select>
          </div>
        )}

        <div className="flex gap-3">
          {isSpeaking ? (
            <button
              onClick={stop}
              className="rounded-full bg-red-500 px-6 py-2.5 font-medium text-white transition hover:bg-red-600"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={speak}
              disabled={!text.trim() || isLoading}
              className="rounded-full bg-emerald-500 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Speak"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/10">
        <h2 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          Realtime TTS (WebSocket demo)
        </h2>
        <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300/80">
          This uses a gapless streaming audio player over WebSocket at{" "}
          <code>ws://localhost:6000/tts</code>. Make sure your TTS server is
          running, then click the button to hear smooth realtime audio.
        </p>
        <div className="mt-3">
          <RealtimeTTS />
        </div>
      </div>

      <nav className="mt-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div className="flex gap-6 text-sm">
          <a
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Speech to Text
          </a>
          <a
            href="/talk-with-ai"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Talk with AI →
          </a>
        </div>
      </nav>
    </div>
  );
}
