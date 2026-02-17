import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log("fuck your self");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text, voice = "nova", model = "tts-1-hd" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: "Text exceeds 4096 characters limit" },
        { status: 400 }
      );
    }

    const mp3 = await openai.audio.speech.create({
      model: model as "tts-1" | "tts-1-hd",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text.trim(),
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[OpenAI TTS]", error);
    const message =
      error instanceof Error ? error.message : "Speech generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
