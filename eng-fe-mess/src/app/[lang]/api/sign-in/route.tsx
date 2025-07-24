// src/app/api/sign-in/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // const body = await req.json();
  const fakeData = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    token: "1234567890",
  };
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 100s
  return NextResponse.json(fakeData, { status: 200 });
}
