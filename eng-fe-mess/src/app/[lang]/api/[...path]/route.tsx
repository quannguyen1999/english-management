import { commonResponse } from "@/app/[lang]/api/common-response";
import { getRouteConfig } from "@/service/api-routes";
import { CLIENT_ID, CLIENT_SECRET, GRANT_TYPE } from "@/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const routeConfig = getRouteConfig(path);

  if (!routeConfig) {
    return new Response("API route not found", { status: 404 });
  }

  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  const fullUrl = `${routeConfig.baseUrl}${routeConfig.endpoint}${
    searchParams ? `?${searchParams}` : ""
  }`;

  const response = await fetch(fullUrl, {
    method: routeConfig.method,
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(req.headers.entries()),
    },
  });

  return commonResponse(response);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const routeConfig = getRouteConfig(path);

  if (!routeConfig) {
    return new Response("API route not found", { status: 404 });
  }

  const body = await req.json();

  // Handle OAuth2 authentication specially
  if (routeConfig.isOAuth2) {
    const { username, password } = body;
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    params.append("grant_type", GRANT_TYPE);
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);

    const response = await fetch(
      `${routeConfig.baseUrl}${routeConfig.endpoint}?${params.toString()}`,
      {
        method: routeConfig.method,
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

  // Handle regular requests
  const response = await fetch(
    `${routeConfig.baseUrl}${routeConfig.endpoint}`,
    {
      method: routeConfig.method,
      body: JSON.stringify(body),
      headers: {
        "content-Type": "application/json",
        accept: "application/json",
      },
    }
  );

  return commonResponse(response);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const routeConfig = getRouteConfig(path);

  if (!routeConfig) {
    return new Response("API route not found", { status: 404 });
  }

  const body = await req.json();
  const response = await fetch(
    `${routeConfig.baseUrl}${routeConfig.endpoint}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(req.headers.entries()),
      },
    }
  );

  return commonResponse(response);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const routeConfig = getRouteConfig(path);

  if (!routeConfig) {
    return new Response("API route not found", { status: 404 });
  }

  const response = await fetch(
    `${routeConfig.baseUrl}${routeConfig.endpoint}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(req.headers.entries()),
      },
    }
  );

  return commonResponse(response);
}
