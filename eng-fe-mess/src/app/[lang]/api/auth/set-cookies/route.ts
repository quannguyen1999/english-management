import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, refresh_token, expires_in } = body;

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: "Access token and refresh token are required" },
        { status: 400 }
      );
    }

    // Create response
    const response = NextResponse.json({ message: "Cookies set successfully" });

    // Set cookies for the tokens
    response.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expires_in || 3600,
    });

    response.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Set cookies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
