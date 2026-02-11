"use client";

import { useRef } from "react";

export default function RealtimeTTS() {
  const wsRef = useRef<WebSocket | null>(null);

  const start = () => {
    const audio = document.createElement("audio");
    audio.autoplay = true;

    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);
    audio.src = objectUrl;

    mediaSource.addEventListener("sourceopen", () => {
      const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

      wsRef.current = new WebSocket("ws://localhost:6000/tts");
      wsRef.current.binaryType = "arraybuffer";

      wsRef.current.onmessage = (event) => {
        if (typeof event.data === "string") {
          if (event.data === "__END__") {
            try {
              mediaSource.endOfStream();
            } catch {
              // ignore
            }
            wsRef.current?.close();
          }
          return;
        }

        try {
          sourceBuffer.appendBuffer(new Uint8Array(event.data));
        } catch {
          // ignore buffer errors for now
        }
      };

      wsRef.current.onopen = () => {
        wsRef.current?.send(
          "Hello from Next.js smooth realtime streaming voice"
        );
      };

      wsRef.current.onerror = () => {
        wsRef.current?.close();
      };
    });

    audio.onended = () => {
      URL.revokeObjectURL(objectUrl);
    };
  };

  return (
    <button
      type="button"
      onClick={start}
      className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-600"
    >
      Start Realtime Voice
    </button>
  );
}
