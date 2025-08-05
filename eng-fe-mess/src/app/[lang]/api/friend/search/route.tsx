// src/app/api/sign-in/route.ts
import { NextRequest, NextResponse } from "next/server";

interface SearchBody {
  search?: string;
  page?: number;
  size?: number;
}

interface FriendData {
  userId: string;
  username: string;
  email: string;
  createdAt: string | null;
  hasConversation: boolean;
  conversationId: string | null;
  friendStatus: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED";
  requestSentByMe: boolean;
  online: boolean;
}

interface ApiResponse {
  page: number;
  size: number;
  total: number;
  data: FriendData[];
  __typename: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body: SearchBody = await req.json();
    const { search = "", page = 0, size = 10 } = body;

    // Debug: Log incoming headers
    console.log("Incoming headers:", Object.fromEntries(req.headers.entries()));

    // Build query parameters for the backend API
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) {
      params.append("username", search);
    }

    // Call the backend API
    const backendUrl = `http://localhost:9000/chat-service/conversations/friend-all?${params.toString()}`;

    // Prepare headers for backend request
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward all incoming headers
    for (const [key, value] of req.headers.entries()) {
      headers[key] = value;
    }

    // If no Authorization header, try to get token from cookies
    if (!headers.authorization && !headers.Authorization) {
      const token = req.cookies.get("access_token")?.value;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log("Added Authorization header from cookie");
      } else {
        console.log("No Authorization header or token found");
      }
    }

    console.log("Backend request headers:", headers);
    console.log("Backend URL:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Backend error response:", errorText);
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in friend search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
