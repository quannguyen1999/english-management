import { Message, MessageResponse } from "@/types/message";
import request from "./api-config";
import { MESSAGES, MESSAGES_SEND } from "./api-routes";

export async function getMessages(
  conversationId: string,
  page: number,
  size: number
) {
  const params = new URLSearchParams({
    conversationId: conversationId,
    page: page.toString(),
    size: size.toString(),
  });
  return request(`${MESSAGES}?${params.toString()}`);
}

export async function sendMessages(
  message: Message
): Promise<{ data: MessageResponse; status: number }> {
  return request<MessageResponse>(MESSAGES_SEND, {
    method: "POST",
    body: JSON.stringify(message),
  });
}
