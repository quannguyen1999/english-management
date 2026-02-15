"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const CHAT_API = "/api/chat";
const CONVERSATIONS_API = "/api/conversations";
const TRANSCRIBE_API = "/api/transcribe";
const SPEAK_API = "/api/speak";

// TTS WebSocket URL - requires Python server from refenrence/ to be running.
// Set NEXT_PUBLIC_TTS_WS_URL in .env.local to override (e.g. ws://localhost:6000/tts).
// To start: cd refenrence && pip install -r requirements.txt && uvicorn server:app --port 8000 --reload
const TTS_WS_URL =
  process.env.NEXT_PUBLIC_TTS_WS_URL || "ws://localhost:8000/tts";
const TTS_VOICE = "en-US-AriaNeural";

const SILENCE_MS = 3000;
const IDLE_STOP_MS = 120000; // 2 minutes of silence after AI speaks → stop conversation

function generateConversationId(): string {
  return (
    "conv_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

const SpeechRecognitionAPI =
  typeof window !== "undefined" &&
  (window.SpeechRecognition ||
    (
      window as unknown as {
        webkitSpeechRecognition?: typeof SpeechRecognition;
      }
    ).webkitSpeechRecognition);

export default function TalkWithAI() {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isWaitingChat, setIsWaitingChat] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsWsConnected, setTtsWsConnected] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const ttsWsRef = useRef<WebSocket | null>(null);
  const ttsMediaSourceRef = useRef<MediaSource | null>(null);
  const ttsSourceBufferRef = useRef<SourceBuffer | null>(null);
  const ttsAudioQueueRef = useRef<Uint8Array[]>([]);
  const ttsEndOfStreamRequestedRef = useRef(false);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(
    null
  );
  const isListeningRef = useRef(false);
  const stopListeningRef = useRef<() => void>(() => {});

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadConversation = useCallback(async (convId: string) => {
    if (!convId) return;
    try {
      const res = await fetch(`${CONVERSATIONS_API}/${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages?.length) {
        setMessages(
          data.messages.map((m: Message) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setConversationId(generateConversationId());
  }, []);

  useEffect(() => {
    loadConversation(conversationId);
  }, [conversationId, loadConversation]);

  // Connect TTS WebSocket on page load so it's ready for first speak
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ws = new WebSocket(TTS_WS_URL);
    ws.binaryType = "arraybuffer";
    ttsWsRef.current = ws;

    ws.onopen = () => {
      setTtsWsConnected(true);
      setError(null);
    };

    ws.onerror = () => {
      setTtsWsConnected(false);
      setError(
        "TTS WebSocket failed. Start the server: cd refenrence && uvicorn server:app --port 8000 --reload"
      );
    };

    ws.onclose = () => {
      setTtsWsConnected(false);
      ttsWsRef.current = null;
    };

    return () => {
      ws.close();
      ttsWsRef.current = null;
      setTtsWsConnected(false);
    };
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  const clearIdleStopTimer = useCallback(() => {
    if (idleStopTimeoutRef.current) {
      clearTimeout(idleStopTimeoutRef.current);
      idleStopTimeoutRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    const trimmed = text.trim();
    if (!trimmed) {
      onEnd?.();
      return;
    }

    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window === "undefined") return;

    try {
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audioRef.current = audio;

      const mediaSource = new MediaSource();
      const objectUrl = URL.createObjectURL(mediaSource);
      audio.src = objectUrl;
      ttsMediaSourceRef.current = mediaSource;

      mediaSource.addEventListener(
        "sourceopen",
        () => {
          const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
          ttsSourceBufferRef.current = sourceBuffer;
          ttsAudioQueueRef.current = [];
          ttsEndOfStreamRequestedRef.current = false;

          const processQueue = () => {
            const sb = ttsSourceBufferRef.current;
            if (!sb) return;
            if (sb.updating) return;
            const next = ttsAudioQueueRef.current.shift();
            if (next) {
              try {
                sb.appendBuffer(next as BufferSource);
              } catch (e) {
                console.error("Error appending TTS buffer:", e);
              }
            } else if (ttsEndOfStreamRequestedRef.current) {
              const ms = ttsMediaSourceRef.current;
              if (ms && ms.readyState === "open") {
                try {
                  ms.endOfStream();
                } catch (e) {
                  console.error("Error ending MediaSource stream:", e);
                }
              }
            }
          };

          sourceBuffer.addEventListener("updateend", processQueue);

          // Reuse pre-opened WebSocket from page load, or create new if not ready
          let ws = ttsWsRef.current;
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            if (ttsWsRef.current) {
              ttsWsRef.current.close();
              ttsWsRef.current = null;
            }
            ws = new WebSocket(TTS_WS_URL);
            ws.binaryType = "arraybuffer";
            ttsWsRef.current = ws;
            ws.onopen = () => {
              setTtsWsConnected(true);
              const payload = {
                text: trimmed,
                lang: "en",
                voice: TTS_VOICE,
                is_last: true,
              };
              ttsWsRef.current?.send(JSON.stringify(payload));
            };
            ws.onclose = () => {
              ttsWsRef.current = null;
              setTtsWsConnected(false);
            };
            ws.onerror = () => setTtsWsConnected(false);
          } else {
            // Already connected - send immediately
            const payload = {
              text: trimmed,
              lang: "en",
              voice: TTS_VOICE,
              is_last: true,
            };
            ws.send(JSON.stringify(payload));
          }

          ws.onmessage = (event) => {
            if (typeof event.data === "string") {
              if (event.data === "__END__") {
                ttsEndOfStreamRequestedRef.current = true;
                if (
                  !sourceBuffer.updating &&
                  ttsAudioQueueRef.current.length === 0
                ) {
                  if (mediaSource.readyState === "open") {
                    mediaSource.endOfStream();
                  }
                }
              } else if (event.data.startsWith("__ERROR__")) {
                const errorMsg = event.data.replace("__ERROR__:", "").trim();
                setError(errorMsg);
                setIsSpeaking(false);
                if (mediaSource.readyState === "open") {
                  mediaSource.endOfStream();
                }
                onEnd?.();
              }
              return;
            }

            ttsAudioQueueRef.current.push(
              new Uint8Array(event.data as ArrayBuffer)
            );
            if (!sourceBuffer.updating) {
              const sb = ttsSourceBufferRef.current;
              if (sb && !sb.updating) {
                const next = ttsAudioQueueRef.current.shift();
                if (next) {
                  try {
                    sb.appendBuffer(next as BufferSource);
                  } catch (e) {
                    console.error("Error appending TTS buffer:", e);
                  }
                }
              }
            }
          };

          ws.onerror = () => {
            setError(
              "TTS WebSocket failed. Start the server: cd refenrence && uvicorn server:app --port 8000 --reload"
            );
            setIsSpeaking(false);
            onEnd?.();
          };

          ws.onclose = () => {
            ttsWsRef.current = null;
          };
        },
        { once: true }
      );

      mediaSource.addEventListener("error", (e) => {
        console.error("MediaSource error:", e);
      });

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(objectUrl);
        audioRef.current = null;
        ttsMediaSourceRef.current = null;
        ttsSourceBufferRef.current = null;
        onEnd?.();
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setError("Failed to play realtime audio");
        URL.revokeObjectURL(objectUrl);
        audioRef.current = null;
        onEnd?.();
      };
      return;
    } catch (err) {
      console.error("Realtime TTS failed, falling back to HTTP:", err);
    }

    // Fallback: existing HTTP TTS endpoint
    try {
      const res = await fetch(SPEAK_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          voice: "nova",
          model: "tts-1-hd",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate speech");
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        onEnd?.();
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setError("Failed to play audio");
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        onEnd?.();
      };

      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      setIsSpeaking(false);
      setError(err instanceof Error ? err.message : "Speech failed");
      onEnd?.();
    }
  }, []);

  const sendMessage = useCallback(
    async (userText: string, onAfterSpeak?: () => void) => {
      if (!userText.trim() || !conversationId) return;

      setError(null);
      setIsWaitingChat(true);
      clearIdleStopTimer();

      const userMessage: Message = {
        id: "local_user_" + Date.now(),
        role: "user",
        content: userText.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const res = await fetch(CHAT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: userText.trim(),
            max_tokens: 1000,
            temperature: 0.5,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Chat failed");

        const aiMessage: Message = {
          id: data.ai_message_id || "local_ai_" + Date.now(),
          role: "assistant",
          content: data.ai_response || "",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (data.ai_response?.trim()) {
          await speak(data.ai_response, onAfterSpeak);
        } else {
          onAfterSpeak?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat request failed");
        onAfterSpeak?.();
      } finally {
        setIsWaitingChat(false);
      }
    },
    [conversationId, speak, clearIdleStopTimer]
  );

  const transcribeAndSend = useCallback(
    async (audioBlob: Blob, onAfterResponse?: () => void) => {
      if (audioBlob.size < 500) {
        setIsTranscribing(false);
        onAfterResponse?.();
        return;
      }

      setIsTranscribing(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        const res = await fetch(TRANSCRIBE_API, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Transcription failed");
        if (data.text?.trim()) {
          await sendMessage(data.text, onAfterResponse);
        } else {
          onAfterResponse?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transcription failed");
        onAfterResponse?.();
      } finally {
        setIsTranscribing(false);
      }
    },
    [sendMessage]
  );

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimeoutRef.current = setTimeout(() => {
      silenceTimeoutRef.current = null;
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    }, SILENCE_MS);
  }, [clearSilenceTimer]);

  const startIdleStopTimer = useCallback(() => {
    if (!isListeningRef.current) return;
    clearIdleStopTimer();
    idleStopTimeoutRef.current = setTimeout(() => {
      idleStopTimeoutRef.current = null;
      if (isListeningRef.current) stopListeningRef.current();
    }, IDLE_STOP_MS);
  }, [clearIdleStopTimer]);

  const startMediaRecorder = useCallback(() => {
    const stream = streamRef.current;
    if (!stream?.active || !isListeningRef.current) return;

    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "";
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      clearSilenceTimer();
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      mediaRecorderRef.current = null;
      if (streamRef.current?.active && isListeningRef.current) {
        transcribeAndSend(blob, () => {
          if (!isListeningRef.current || !streamRef.current?.active) return;
          startMediaRecorder();
          resetSilenceTimer();
          startIdleStopTimer();
        });
      }
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
  }, [
    clearSilenceTimer,
    transcribeAndSend,
    resetSilenceTimer,
    startIdleStopTimer,
  ]);

  const startListening = useCallback(async () => {
    setError(null);
    if (!conversationId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isListeningRef.current = true;

      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = () => resetSilenceTimer();
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (event.error !== "aborted" && event.error !== "network") {
            setError(`Speech recognition: ${event.error}`);
          }
        };
        recognition.start();
        recognitionRef.current = recognition;
      }

      startMediaRecorder();
      resetSilenceTimer();
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone access failed");
      isListeningRef.current = false;
    }
  }, [conversationId, startMediaRecorder, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    clearSilenceTimer();
    clearIdleStopTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  }, [clearSilenceTimer, clearIdleStopTimer]);

  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const startNewConversation = useCallback(() => {
    stopListening();
    if (ttsWsRef.current) {
      ttsWsRef.current.close();
      ttsWsRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setConversationId(generateConversationId());
    setMessages([]);
    setError(null);
  }, [stopListening]);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      clearSilenceTimer();
      clearIdleStopTimer();
      if (ttsWsRef.current) {
        ttsWsRef.current.close();
        ttsWsRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [clearSilenceTimer, clearIdleStopTimer]);

  const busy = isTranscribing || isWaitingChat || isSpeaking;

  return (
    <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Talk with AI Teacher
        </h1>
        <button
          type="button"
          onClick={startNewConversation}
          disabled={busy || isListening}
          className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
        >
          New conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && !isTranscribing && !isWaitingChat && (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            Click the mic to start. Speak; after 3 seconds of silence your
            message is sent to the AI and the reply is read aloud. We keep
            waiting for you; if you stay silent for 2 minutes, the conversation
            stops.
          </p>
        )}
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                <p className="text-sm font-medium whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          {isTranscribing && (
            <div className="flex justify-end">
              <div className="rounded-2xl bg-zinc-200 px-4 py-2.5 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                Transcribing…
              </div>
            </div>
          )}
          {isWaitingChat && !isTranscribing && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-zinc-200 px-4 py-2.5 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                AI is thinking…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
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

      <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleListening}
            disabled={busy || !conversationId}
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
            {isListening
              ? "Listening… Speak, then stay silent 3s to send. Silent 2 min stops the conversation. Click to stop."
              : busy
              ? "Waiting for AI…"
              : "Click mic to start real-time talk"}
          </span>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Conversation: {conversationId || "—"}
          <span
            className={`ml-2 inline-flex items-center gap-1 ${
              ttsWsConnected ? "text-emerald-600 dark:text-emerald-400" : ""
            }`}
            title={
              ttsWsConnected
                ? "TTS connected"
                : "TTS connecting or disconnected"
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                ttsWsConnected ? "bg-emerald-500" : "bg-zinc-400"
              }`}
            />
            {ttsWsConnected ? "TTS ready" : "TTS…"}
          </span>
        </p>
      </div>

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
    </div>
  );
}
