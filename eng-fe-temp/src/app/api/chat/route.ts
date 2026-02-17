import { NextRequest, NextResponse } from "next/server";

const CHAT_API = "http://127.0.0.1:5000/chat";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversation_id,
      message,
      max_tokens = 1000,
      temperature = 0.5,
    } = body;

    if (!conversation_id || typeof message !== "string") {
      return NextResponse.json(
        { error: "conversation_id and message are required" },
        { status: 400 }
      );
    }

    const res = await fetch(CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id,
        message: message.trim(),
        max_tokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || data.message || "Chat request failed" },
        { status: res.status }
      );
    }

    if (!res.body) {
      return NextResponse.json({ error: "No response body" }, { status: 500 });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Chat API]", error);
    const message =
      error instanceof Error ? error.message : "Chat request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
