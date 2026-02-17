"use client";

import { speakViaHttp } from "@/lib/api";
import { CONFIG, TTS_VOICE, TTS_WS_URL } from "@/lib/config";
import { useCallback, useEffect, useRef, useState } from "react";

const TTS_ERROR_MESSAGE =
  "TTS WebSocket failed. Start the server: cd eng-be-text-to-speach && uvicorn server:app --port 8000 --reload";

const SENTENCE_END = /[.!?](?:\s|$)/;

export interface SpeakStreamController {
  append: (chunk: string) => void;
  end: () => void;
  abort: () => void;
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const endOfStreamRequestedRef = useRef(false);

  const streamBufferRef = useRef("");
  const streamQueueRef = useRef<string[]>([]);
  const streamProcessingRef = useRef(false);
  const streamFinishedRef = useRef(false);
  const streamOnAllDoneRef = useRef<(() => void) | null>(null);
  const streamAbortedRef = useRef(false);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    mediaSourceRef.current = null;
    sourceBufferRef.current = null;
    audioQueueRef.current = [];
    endOfStreamRequestedRef.current = false;
  }, []);

  const speak = useCallback(
    async (text: string, onEnd?: () => void) => {
      const trimmed = text.trim();
      if (!trimmed) {
        onEnd?.();
        return;
      }

      setError(null);
      cleanupAudio();

      if (typeof window === "undefined") return;

      try {
        const success = await speakViaWebSocket(trimmed, {
          onPlay: () => setIsSpeaking(true),
          onEnd: () => {
            setIsSpeaking(false);
            cleanupAudio();
            onEnd?.();
          },
          onError: (msg) => {
            setError(msg);
            setIsSpeaking(false);
            cleanupAudio();
            onEnd?.();
          },
          setWsConnected,
          wsRef,
          mediaSourceRef,
          sourceBufferRef,
          audioQueueRef,
          endOfStreamRequestedRef,
          audioRef,
        });

        if (success) return;
      } catch (err) {
        console.error("Realtime TTS failed, falling back to HTTP:", err);
      }

      // Fallback: HTTP TTS
      try {
        const blob = await speakViaHttp(trimmed);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          onEnd?.();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setError("Failed to play audio");
          URL.revokeObjectURL(url);
          audioRef.current = null;
          onEnd?.();
        };
        await audio.play();
      } catch (err) {
        setIsSpeaking(false);
        setError(err instanceof Error ? err.message : "Speech failed");
        onEnd?.();
      }
    },
    [cleanupAudio]
  );

  // Pre-connect WebSocket on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ws = new WebSocket(TTS_WS_URL);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      setError(null);
    };
    ws.onerror = () => {
      setWsConnected(false);
      setError(TTS_ERROR_MESSAGE);
    };
    ws.onclose = () => {
      setWsConnected(false);
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setWsConnected(false);
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const clearError = useCallback(() => setError(null), []);

  const processStreamQueue = useCallback(() => {
    if (streamProcessingRef.current || streamQueueRef.current.length === 0) {
      if (
        streamFinishedRef.current &&
        streamQueueRef.current.length === 0 &&
        !streamProcessingRef.current
      ) {
        streamOnAllDoneRef.current?.();
        streamOnAllDoneRef.current = null;
      }
      return;
    }

    const next = streamQueueRef.current.shift();
    if (!next || streamAbortedRef.current) {
      if (streamFinishedRef.current && streamQueueRef.current.length === 0) {
        streamOnAllDoneRef.current?.();
        streamOnAllDoneRef.current = null;
      }
      return;
    }

    streamProcessingRef.current = true;
    speakViaWebSocket(next, {
      onPlay: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        streamProcessingRef.current = false;
        processStreamQueue();
      },
      onError: (msg) => {
        setError(msg);
        setIsSpeaking(false);
        streamProcessingRef.current = false;
        streamAbortedRef.current = true;
        streamOnAllDoneRef.current?.();
        streamOnAllDoneRef.current = null;
      },
      setWsConnected,
      wsRef,
      mediaSourceRef,
      sourceBufferRef,
      audioQueueRef,
      endOfStreamRequestedRef,
      audioRef,
    }).catch(() => {
      streamProcessingRef.current = false;
      processStreamQueue();
    });
  }, []);

  const speakStream = useCallback(() => {
    streamBufferRef.current = "";
    streamQueueRef.current = [];
    streamProcessingRef.current = false;
    streamFinishedRef.current = false;
    streamAbortedRef.current = false;
    setError(null);
    cleanupAudio();

    const flushBuffer = () => {
      const text = streamBufferRef.current.trim();
      streamBufferRef.current = "";
      if (text) {
        streamQueueRef.current.push(text);
        processStreamQueue();
      }
    };

    const controller: SpeakStreamController = {
      append(chunk: string) {
        if (streamAbortedRef.current || streamFinishedRef.current) return;
        streamBufferRef.current += chunk;
        const buf = streamBufferRef.current;
        const match = buf.match(SENTENCE_END);
        if (match) {
          const endIdx = buf.indexOf(match[0]) + match[0].length;
          const speakable = buf.slice(0, endIdx).trim();
          streamBufferRef.current = buf.slice(endIdx);
          if (speakable) {
            streamQueueRef.current.push(speakable);
            processStreamQueue();
          }
        } else if (buf.length >= CONFIG.ttsChunkMaxChars) {
          const cut = buf.slice(0, CONFIG.ttsChunkMaxChars);
          const lastSpace = cut.lastIndexOf(" ");
          const speakable = (
            lastSpace > 20 ? cut.slice(0, lastSpace) : cut
          ).trim();
          streamBufferRef.current = buf.slice(speakable.length);
          if (speakable) {
            streamQueueRef.current.push(speakable);
            processStreamQueue();
          }
        }
      },
      end() {
        streamFinishedRef.current = true;
        flushBuffer();
        processStreamQueue();
      },
      abort() {
        streamAbortedRef.current = true;
        streamBufferRef.current = "";
        streamQueueRef.current = [];
        cleanupAudio();
        const cb = streamOnAllDoneRef.current;
        streamOnAllDoneRef.current = null;
        cb?.();
      },
    };

    return controller;
  }, [cleanupAudio, processStreamQueue]);

  const speakStreamWithCallback = useCallback(
    (onAllDone?: () => void) => {
      const ctrl = speakStream();
      streamOnAllDoneRef.current = onAllDone ?? null;
      return ctrl;
    },
    [speakStream]
  );

  return {
    speak,
    speakStream: speakStreamWithCallback,
    isSpeaking,
    error,
    clearError,
    wsConnected,
    cleanupAudio,
  };
}

// --- WebSocket TTS implementation (extracted for clarity) ---

interface SpeakViaWsCallbacks {
  onPlay: () => void;
  onEnd: () => void;
  onError: (msg: string) => void;
  setWsConnected: (v: boolean) => void;
}

async function speakViaWebSocket(
  text: string,
  callbacks: SpeakViaWsCallbacks & {
    wsRef: React.MutableRefObject<WebSocket | null>;
    mediaSourceRef: React.MutableRefObject<MediaSource | null>;
    sourceBufferRef: React.MutableRefObject<SourceBuffer | null>;
    audioQueueRef: React.MutableRefObject<Uint8Array[]>;
    endOfStreamRequestedRef: React.MutableRefObject<boolean>;
    audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  }
): Promise<boolean> {
  const {
    onPlay,
    onEnd,
    onError,
    setWsConnected,
    wsRef,
    mediaSourceRef,
    sourceBufferRef,
    audioQueueRef,
    endOfStreamRequestedRef,
    audioRef,
  } = callbacks;

  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.autoplay = true;
    audioRef.current = audio;

    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);
    audio.src = objectUrl;
    mediaSourceRef.current = mediaSource;

    mediaSource.addEventListener(
      "sourceopen",
      () => {
        const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
        sourceBufferRef.current = sourceBuffer;
        audioQueueRef.current = [];
        endOfStreamRequestedRef.current = false;

        const processQueue = () => {
          const sb = sourceBufferRef.current;
          if (!sb || sb.updating) return;
          const next = audioQueueRef.current.shift();
          if (next) {
            try {
              sb.appendBuffer(next as BufferSource);
            } catch (e) {
              console.error("Error appending TTS buffer:", e);
            }
          } else if (endOfStreamRequestedRef.current) {
            const ms = mediaSourceRef.current;
            if (ms?.readyState === "open") {
              try {
                ms.endOfStream();
              } catch (e) {
                console.error("Error ending MediaSource stream:", e);
              }
            }
          }
        };

        sourceBuffer.addEventListener("updateend", processQueue);

        let ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          wsRef.current?.close();
          wsRef.current = null;
          ws = new WebSocket(TTS_WS_URL);
          ws.binaryType = "arraybuffer";
          wsRef.current = ws;
          ws.onopen = () => {
            setWsConnected(true);
            ws?.send(
              JSON.stringify({
                text,
                lang: "en",
                voice: TTS_VOICE,
                is_last: true,
              })
            );
          };
          ws.onclose = () => {
            wsRef.current = null;
            setWsConnected(false);
          };
          ws.onerror = () => setWsConnected(false);
        } else {
          ws.send(
            JSON.stringify({
              text,
              lang: "en",
              voice: TTS_VOICE,
              is_last: true,
            })
          );
        }

        ws.onmessage = (event: MessageEvent) => {
          if (typeof event.data === "string") {
            if (event.data === "__END__") {
              endOfStreamRequestedRef.current = true;
              if (
                !sourceBuffer.updating &&
                audioQueueRef.current.length === 0 &&
                mediaSource.readyState === "open"
              ) {
                mediaSource.endOfStream();
              }
            } else if (event.data.startsWith("__ERROR__")) {
              const msg = event.data.replace("__ERROR__:", "").trim();
              onError(msg);
              if (mediaSource.readyState === "open") mediaSource.endOfStream();
            }
            return;
          }

          audioQueueRef.current.push(new Uint8Array(event.data as ArrayBuffer));
          if (!sourceBuffer.updating) {
            const next = audioQueueRef.current.shift();
            if (next) {
              try {
                sourceBuffer.appendBuffer(next as BufferSource);
              } catch (e) {
                console.error("Error appending TTS buffer:", e);
              }
            }
          }
        };

        ws.onerror = () => {
          onError(TTS_ERROR_MESSAGE);
          onEnd();
        };
      },
      { once: true }
    );

    audio.onplay = onPlay;
    audio.onended = () => {
      URL.revokeObjectURL(objectUrl);
      onEnd();
    };
    audio.onerror = () => {
      onError("Failed to play realtime audio");
      URL.revokeObjectURL(objectUrl);
      onEnd();
    };

    resolve(true);
  });
}
