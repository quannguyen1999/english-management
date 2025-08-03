import { CLIENT_ID, CLIENT_SECRET, GRANT_TYPE, USER_API } from "@/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  params.append("grant_type", GRANT_TYPE);
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  console.log("params: ", params.toString());
  const response = await fetch(
    `${USER_API}/oauth2/token?${params.toString()}`,
    {
      method: "POST",
    }
  );

  const responseData = await response.json();
  const responseStatus = response.status;

  // If authentication is successful, set cookies for tokens
  if (responseStatus === 200 && responseData.access_token) {
    const nextResponse = NextResponse.json(responseData, {
      status: responseStatus,
    });

    // Set cookies for the tokens
    nextResponse.cookies.set("access_token", responseData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: responseData.expires_in,
    });

    nextResponse.cookies.set("refresh_token", responseData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return nextResponse;
  }

  return NextResponse.json(responseData, { status: responseStatus });
}
