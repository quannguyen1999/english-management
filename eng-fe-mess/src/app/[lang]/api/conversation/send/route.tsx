import { NextRequest, NextResponse } from "next/server";
import { sendMessage as sendMessageApi } from "@/service/api-conversation";
import { Message } from "@/types/message";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, message } = body;
    
    if (!id || !message) {
      return NextResponse.json(
        { error: 'Missing conversation ID or message' },
        { status: 400 }
      );
    }
    
    const messageData: Message = {
      content: message,
      type: 'TEXT',
      conversationId: id,
    };
    
    const response = await sendMessageApi(messageData);
    
    if (response.status === 200) {
      return NextResponse.json(response.data, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 