// src/app/api/sign-in/route.ts
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = {
    id: crypto.randomUUID(),
    message: body.message,
    createdAt: "2021-01-18",
    sender: "Jane Doe",
    receiver: "John Doe",
  };
  return NextResponse.json(data, { status: 200 });
}
