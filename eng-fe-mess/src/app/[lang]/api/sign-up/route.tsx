// src/app/api/sign-in/route.ts
import { commonResponse } from "@/app/[lang]/api/common-response";
import { USER_API } from "@/config";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const response = await fetch(`${USER_API}/users`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return commonResponse(response);
}
