// src/app/api/sign-in/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loadMessages } from "@/service/api-conversation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    
    // Await the params object before accessing its properties
    const { id } = await params;
    const response = await loadMessages(id, page, size);
    
    if (response.status === 200) {
      return NextResponse.json(response.data, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Failed to load messages' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
