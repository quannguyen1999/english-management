"use client";

import { transcribeAudio } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined" &&
  (window.SpeechRecognition ||
    (
      window as unknown as {
        webkitSpeechRecognition?: typeof SpeechRecognition;
      }
    ).webkitSpeechRecognition);

export type SpeechStatus = "idle" | "listening" | "transcribing";

export function useSpeechToText(options: {
  onFinalText: (text: string, onAfterResponse?: () => void) => Promise<void>;
  conversationId: string;
  setError: (err: string | null) => void;
}) {
  const { onFinalText, conversationId, setError } = options;

  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [isListening, setIsListening] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const userSpeakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(
    null
  );
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isListeningRef = useRef(false);
  const stopListeningRef = useRef<() => void>(() => {});

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

  const clearUserSpeakingTimer = useCallback(() => {
    if (userSpeakingTimeoutRef.current) {
      clearTimeout(userSpeakingTimeoutRef.current);
      userSpeakingTimeoutRef.current = null;
    }
  }, []);

  const markUserSpeaking = useCallback(() => {
    setUserSpeaking(true);
    clearUserSpeakingTimer();
    userSpeakingTimeoutRef.current = setTimeout(() => {
      userSpeakingTimeoutRef.current = null;
      setUserSpeaking(false);
    }, CONFIG.userSpeakingDebounceMs);
  }, [clearUserSpeakingTimer]);

  const transcribeAndSend = useCallback(
    async (audioBlob: Blob, onAfterResponse?: () => void) => {
      if (audioBlob.size < CONFIG.minAudioSize) {
        setStatus("idle");
        onAfterResponse?.();
        return;
      }

      setStatus("transcribing");
      setError(null);

      try {
        const { text } = await transcribeAudio(audioBlob);
        if (text?.trim()) {
          await onFinalText(text, onAfterResponse);
        } else {
          onAfterResponse?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transcription failed");
        onAfterResponse?.();
      } finally {
        setStatus("idle");
      }
    },
    [onFinalText, setError]
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
    }, CONFIG.silenceMs);
  }, [clearSilenceTimer]);

  const startIdleStopTimer = useCallback(() => {
    if (!isListeningRef.current) return;
    clearIdleStopTimer();
    idleStopTimeoutRef.current = setTimeout(() => {
      idleStopTimeoutRef.current = null;
      if (isListeningRef.current) stopListeningRef.current();
    }, CONFIG.idleStopMs);
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
          setStatus("listening");
        });
      }
    };

    recorder.start(CONFIG.recorderTimeslice);
    mediaRecorderRef.current = recorder;
  }, [
    clearSilenceTimer,
    transcribeAndSend,
    resetSilenceTimer,
    startIdleStopTimer,
  ]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setUserSpeaking(false);
    clearUserSpeakingTimer();
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

    setStatus("idle");
    setIsListening(false);
  }, [clearUserSpeakingTimer, clearSilenceTimer, clearIdleStopTimer]);

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
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          resetSilenceTimer();
          const hasSpeech = Array.from(event.results).some(
            (r) => r.length > 0 && r[0].transcript?.trim()
          );
          if (hasSpeech) markUserSpeaking();
        };
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
      startIdleStopTimer();
      setStatus("listening");
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone access failed");
      isListeningRef.current = false;
    }
  }, [
    conversationId,
    startMediaRecorder,
    resetSilenceTimer,
    startIdleStopTimer,
    markUserSpeaking,
    setError,
  ]);

  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      clearUserSpeakingTimer();
      clearSilenceTimer();
      clearIdleStopTimer();
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
    };
  }, [clearUserSpeakingTimer, clearSilenceTimer, clearIdleStopTimer]);

  return {
    startListening,
    stopListening,
    status,
    isListening,
    userSpeaking,
  };
}
