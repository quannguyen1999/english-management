import { NextRequest, NextResponse } from "next/server";

const TRANSLATE_API = "http://127.0.0.1:5000/translate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, src = "en", dest = "vi" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const res = await fetch(TRANSLATE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), src, dest }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Translation failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({ translated: data.translated ?? "" });
  } catch (error) {
    console.error("[Translate API]", error);
    const message =
      error instanceof Error ? error.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
