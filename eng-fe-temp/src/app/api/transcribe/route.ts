import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("[Whisper API]", error);
    const message =
      error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
