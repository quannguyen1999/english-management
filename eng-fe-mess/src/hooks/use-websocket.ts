import { useCallback, useEffect, useRef } from "react";
import websocketService from "../service/websocket.service";
import {
  AudioCallNotification,
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

  // Listen to audio call notifications
  const onAudioCall = useCallback(
    (callback: (notification: AudioCallNotification) => void) => {
      const unsubscribe = websocketService.onAudioCall(callback);
      unsubscribeRefs.current.push(unsubscribe);
      return unsubscribe;
    },
    []
  );

  // Send message
  const sendMessage = useCallback((conversationId: string, message: any) => {
    websocketService.sendMessage(conversationId, message);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback(
    (conversationId: string, typingData: MessageTypingResponse) => {
      websocketService.sendTyping(conversationId, typingData);
    },
    []
  );

  // Send user status
  const sendUserStatus = useCallback((userId: string, isOnline: boolean) => {
    websocketService.sendUserStatus(userId, isOnline);
  }, []);

  // Check connection status
  const isConnected = useCallback(() => {
    return websocketService.isWebSocketConnected();
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  return {
    subscribeToConversation,
    subscribeToTyping,
    subscribeToUserStatus,
    onMessage,
    onTyping,
    onUserStatus,
    onAudioCall,
    sendMessage,
    sendTyping,
    sendUserStatus,
    isConnected,
    disconnect,
    cleanup,
  };
};
