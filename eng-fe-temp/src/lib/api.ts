/**
 * Centralized API layer with typed requests/responses.
 */

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export interface ChatPayload {
  conversation_id: string;
  message: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  ai_response: string;
  ai_message_id?: string;
  error?: string;
}

export interface ConversationResponse {
  messages: Message[];
  error?: string;
}

export interface TranscribeResponse {
  text: string;
  error?: string;
}

export interface StreamChatCallbacks {
  onChunk: (chunk: string) => void;
  onDone: (data: { ai_message_id?: string; ai_response: string }) => void;
  onError: (error: string) => void;
}

export async function sendChatMessageStream(
  payload: ChatPayload,
  callbacks: StreamChatCallbacks
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: payload.conversation_id,
      message: payload.message.trim(),
      max_tokens: payload.max_tokens ?? 1000,
      temperature: payload.temperature ?? 0.5,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || "Chat failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.error) {
          callbacks.onError(data.error);
          return;
        }
        if (data.chunk) {
          callbacks.onChunk(data.chunk);
        }
        if (data.done) {
          callbacks.onDone({
            ai_message_id: data.ai_message_id,
            ai_response: data.ai_response ?? "",
          });
          return;
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  if (buffer.startsWith("data: ")) {
    try {
      const data = JSON.parse(buffer.slice(6));
      if (data.done) {
        callbacks.onDone({
          ai_message_id: data.ai_message_id,
          ai_response: data.ai_response ?? "",
        });
      }
    } catch {
      // ignore
    }
  }
}

export async function loadConversation(
  conversationId: string
): Promise<ConversationResponse | null> {
  if (!conversationId) return null;
  const res = await fetch(`/api/conversations/${conversationId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function transcribeAudio(
  audioBlob: Blob
): Promise<TranscribeResponse> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  const res = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });
  const data: TranscribeResponse = await res.json();
  if (!res.ok) throw new Error(data.error || "Transcription failed");
  return data;
}

export interface TranslateResponse {
  translated: string;
  error?: string;
}

export async function translateToVietnamese(
  text: string,
  options?: { src?: string; dest?: string }
): Promise<string> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text.trim(),
      src: options?.src ?? "en",
      dest: options?.dest ?? "vi",
    }),
  });
  const data: TranslateResponse & { error?: string } = await res.json();
  if (!res.ok) throw new Error(data.error || "Translation failed");
  return data.translated ?? "";
}

export async function speakViaHttp(
  text: string,
  options?: { voice?: string; model?: string }
): Promise<Blob> {
  const res = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text.trim(),
      voice: options?.voice ?? "nova",
      model: options?.model ?? "tts-1-hd",
    }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to generate speech");
  }
  return res.blob();
}
