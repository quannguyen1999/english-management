import { useCallback, useEffect, useRef } from "react";
import websocketService from "../service/websocket.service";
import {
  Message,
  MessageStatusUserResponse,
  MessageTypingResponse,
} from "../types/message";

export const useWebSocket = () => {
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  // Initialize WebSocket connection when hook is used
  useEffect(() => {
    websocketService.initialize();
  }, []);

  // Cleanup function to unsubscribe from all listeners
  const cleanup = useCallback(() => {
    unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
    unsubscribeRefs.current = [];
  }, []);

  // Subscribe to conversation messages
  const subscribeToConversation = useCallback((conversationId: string) => {
    websocketService.subscribeToConversation(conversationId);
  }, []);

  // Subscribe to typing indicators
  const subscribeToTyping = useCallback((conversationId: string) => {
    websocketService.subscribeToTyping(conversationId);
  }, []);

  // Subscribe to user status
  const subscribeToUserStatus = useCallback((userId: string) => {
    websocketService.subscribeStatusUserOnline(userId);
  }, []);

  // Listen to messages
  const onMessage = useCallback((callback: (message: Message) => void) => {
    const unsubscribe = websocketService.onMessage(callback);
    unsubscribeRefs.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  // Listen to typing indicators
  const onTyping = useCallback(
    (callback: (typing: MessageTypingResponse) => void) => {
      const unsubscribe = websocketService.onTyping(callback);
      unsubscribeRefs.current.push(unsubscribe);
      return unsubscribe;
    },
    []
  );

  // Listen to user status changes
  const onUserStatus = useCallback(
    (callback: (status: MessageStatusUserResponse) => void) => {
      const unsubscribe = websocketService.onStatusUser(callback);
      unsubscribeRefs.current.push(unsubscribe);
      return unsubscribe;
    },
    []
  );

  // Send message
  const sendMessage = useCallback((message: Partial<Message>) => {
    websocketService.sendMessage(message);
  }, []);

  // Mark message as read
  const markAsRead = useCallback(
    (messageId: string, conversationId: string) => {
      websocketService.markAsRead(messageId, conversationId);
    },
    []
  );

  // Mark message as delivered
  const markAsDelivered = useCallback(
    (messageId: string, conversationId: string) => {
      websocketService.markAsDelivered(messageId, conversationId);
    },
    []
  );

  // Add reaction to message
  const addReaction = useCallback(
    (messageId: string, conversationId: string, reaction: string) => {
      websocketService.addReaction(messageId, conversationId, reaction);
    },
    []
  );

  // Publish typing indicator
  const publishTyping = useCallback(
    (conversationId: string, payload: Object) => {
      websocketService.publishTyping(conversationId, payload);
    },
    []
  );

  // Publish user status
  const publishUserStatus = useCallback((userId: string, online: boolean) => {
    websocketService.publishStatusUser(userId, online);
  }, []);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return websocketService.getConnectionStatus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Connection management
    subscribeToConversation,
    subscribeToTyping,
    subscribeToUserStatus,
    getConnectionStatus,

    // Event listeners
    onMessage,
    onTyping,
    onUserStatus,

    // Message actions
    sendMessage,
    markAsRead,
    markAsDelivered,
    addReaction,

    // Publishing
    publishTyping,
    publishUserStatus,

    // Cleanup
    cleanup,
  };
};
