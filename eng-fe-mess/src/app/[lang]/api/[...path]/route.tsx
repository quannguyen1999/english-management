import { commonResponse } from "@/app/[lang]/api/common-response";
import { getRouteConfig } from "@/service/api-routes";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
  const routeConfig = getRouteConfig(path);
  if (!routeConfig) {
    return new Response("API route not found", { status: 404 });
  }
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  const fullUrl = `${routeConfig.baseUrl}${routeConfig.endpoint.replace(
    "/api",
    ""
  )}${searchParams ? `?${searchParams}` : ""}`;
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
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
  const routeConfig = getRouteConfig(path);
  if (!routeConfig) {
    return new Response("API route not found", { status: 404 });
  }
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  const fullUrl = `${routeConfig.baseUrl}${routeConfig.endpoint.replace(
    "/api",
    ""
  )}${searchParams ? `?${searchParams}` : ""}`;
  const body = await req.json();
  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(
        req.headers.entries().filter(([key]) => key !== "content-type")
      ),
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  return commonResponse(response);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
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
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
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
