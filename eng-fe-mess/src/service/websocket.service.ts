import { Client } from "@stomp/stompjs";
import { CHAT_API } from "../config";
import {
  AudioCallNotification,
  Message,
  MessageStatusUserResponse,
  MessageTypingResponse,
} from "../types/message";

interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketService {
  private isConnected = false;
  private readonly BASE_URL = `${CHAT_API}/ws`;
  public stompClient: Client | null = null;
  private subscriptions: any[] = [];
  private messageListeners: ((message: Message) => void)[] = [];
  private typingListeners: ((typing: MessageTypingResponse) => void)[] = [];
  private statusUserListeners: ((status: MessageStatusUserResponse) => void)[] =
    [];
  private audioCallListeners: ((
    notification: AudioCallNotification
  ) => void)[] = [];
  private connectionAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private pendingSubscriptions: Array<{ method: string; args: any[] }> = [];
  private isConnecting = false; // Prevent multiple simultaneous connection attempts

  constructor() {
    // Don't connect immediately - wait for explicit connection request
    // This prevents connection attempts without proper authentication
  }

  public initialize() {
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      this.connect();
    } else {
      console.log(
        "No token found, WebSocket will connect when token is available"
      );
    }
  }

  private connect(): void {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.warn("No token available for WebSocket connection");
      return;
    }

    if (this.isConnecting || this.isConnected) {
      console.log("WebSocket connection already in progress or connected");
      return;
    }

    this.isConnecting = true;
    console.log("Attempting to connect to WebSocket at:", this.BASE_URL);

    this.stompClient = new Client({
      brokerURL: this.BASE_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectionTimeout: 10000,

      onConnect: (frame: any) => {
        console.log("STOMP connected:", frame);
        this.isConnected = true;
        this.isConnecting = false;
        this.connectionAttempts = 0;

        // Process any pending subscriptions
        this.processPendingSubscriptions();
      },

      onStompError: (frame: any) => {
        console.error("STOMP error:", frame);
        this.isConnected = false;
        this.isConnecting = false;
        this.handleConnectionError();
      },
    });

    this.stompClient.onWebSocketClose = (event: any) => {
      console.log("WebSocket closed:", event);
      this.isConnected = false;
      this.isConnecting = false;
      this.handleConnectionError();
    };

    this.stompClient.onWebSocketError = (event: any) => {
      console.error("WebSocket error:", event);
      this.isConnected = false;
      this.isConnecting = false;
      this.handleConnectionError();
    };

    this.stompClient.onDisconnect = (frame: any) => {
      console.log("STOMP disconnected:", frame);
      this.isConnected = false;
      this.isConnecting = false;
      this.handleConnectionError();
    };

    this.stompClient.activate();
  }

  private handleConnectionError() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
    this.isConnected = false;

    if (this.connectionAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.connectionAttempts++;
      console.log(
        `Connection attempt ${this.connectionAttempts}/${this.MAX_RECONNECT_ATTEMPTS} failed. Retrying...`
      );
      setTimeout(() => this.connect(), 5000);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  private processPendingSubscriptions() {
    this.pendingSubscriptions.forEach(({ method, args }) => {
      (this as any)[method](...args);
    });
    this.pendingSubscriptions = [];
  }

  private executeOrQueue(method: string, args: any[]) {
    if (this.isConnected) {
      (this as any)[method](...args);
    } else {
      this.pendingSubscriptions.push({ method, args });
    }
  }

  public subscribeToConversation(conversationId: string) {
    this.executeOrQueue("_subscribeToConversation", [conversationId]);
  }

  private _subscribeToConversation(conversationId: string) {
    if (!this.stompClient || !this.isConnected) {
      console.warn("WebSocket not connected");
      return;
    }

    const subscription = this.stompClient.subscribe(
      `/topic/conversations/${conversationId}`,
      (message) => {
        try {
          const messageData = JSON.parse(message.body);
          this.messageListeners.forEach((listener) => listener(messageData));
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }
    );

    this.subscriptions.push(subscription);
    console.log(`Subscribed to conversation: ${conversationId}`);
  }

  public subscribeToTyping(conversationId: string) {
    this.executeOrQueue("_subscribeToTyping", [conversationId]);
  }

  private _subscribeToTyping(conversationId: string) {
    if (!this.stompClient || !this.isConnected) {
      console.warn("WebSocket not connected");
      return;
    }

    const subscription = this.stompClient.subscribe(
      `/topic/conversations/${conversationId}/typing`,
      (message) => {
        try {
          const typingData = JSON.parse(message.body);
          this.typingListeners.forEach((listener) => listener(typingData));
        } catch (error) {
          console.error("Error parsing typing message:", error);
        }
      }
    );

    this.subscriptions.push(subscription);
    console.log(`Subscribed to typing for conversation: ${conversationId}`);
  }

  public subscribeStatusUserOnline(userId: string) {
    this.executeOrQueue("_subscribeStatusUserOnline", [userId]);
  }

  private _subscribeStatusUserOnline(userId: string) {
    if (!this.stompClient || !this.isConnected) {
      console.warn("WebSocket not connected");
      return;
    }

    // Subscribe to user status updates
    const statusSubscription = this.stompClient.subscribe(
      `/topic/user/${userId}/status`,
      (message) => {
        try {
          const statusData = JSON.parse(message.body);
          this.statusUserListeners.forEach((listener) => listener(statusData));
        } catch (error) {
          console.error("Error parsing status message:", error);
        }
      }
    );

    // Subscribe to incoming call notifications
    const incomingCallSubscription = this.stompClient.subscribe(
      `/topic/user/${userId}/incoming-call`,
      (message) => {
        try {
          const callData = JSON.parse(message.body);
          const notification: AudioCallNotification = {
            type: "INCOMING_CALL",
            data: callData,
          };
          this.audioCallListeners.forEach((listener) => listener(notification));
        } catch (error) {
          console.error("Error parsing incoming call message:", error);
        }
      }
    );

    // Subscribe to call accepted notifications
    const callAcceptedSubscription = this.stompClient.subscribe(
      `/topic/user/${userId}/call-accepted`,
      (message) => {
        try {
          const callData = JSON.parse(message.body);
          const notification: AudioCallNotification = {
            type: "CALL_ACCEPTED",
            data: callData,
          };
          this.audioCallListeners.forEach((listener) => listener(notification));
        } catch (error) {
          console.error("Error parsing call accepted message:", error);
        }
      }
    );

    // Subscribe to call rejected notifications
    const callRejectedSubscription = this.stompClient.subscribe(
      `/topic/user/${userId}/call-rejected`,
      (message) => {
        try {
          const callData = JSON.parse(message.body);
          const notification: AudioCallNotification = {
            type: "CALL_REJECTED",
            data: callData,
          };
          this.audioCallListeners.forEach((listener) => listener(notification));
        } catch (error) {
          console.error("Error parsing call rejected message:", error);
        }
      }
    );

    // Subscribe to call ended notifications
    const callEndedSubscription = this.stompClient.subscribe(
      `/topic/user/${userId}/call-ended`,
      (message) => {
        try {
          const callData = JSON.parse(message.body);
          const notification: AudioCallNotification = {
            type: "CALL_ENDED",
            data: callData,
          };
          this.audioCallListeners.forEach((listener) => listener(notification));
        } catch (error) {
          console.error("Error parsing call ended message:", error);
        }
      }
    );

    this.subscriptions.push(
      statusSubscription,
      incomingCallSubscription,
      callAcceptedSubscription,
      callRejectedSubscription,
      callEndedSubscription
    );

    console.log(`Subscribed to user status and calls for user: ${userId}`);
  }

  public onMessage(callback: (message: Message) => void) {
    this.messageListeners.push(callback);
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  public onTyping(callback: (typing: MessageTypingResponse) => void) {
    this.typingListeners.push(callback);
    return () => {
      const index = this.typingListeners.indexOf(callback);
      if (index > -1) {
        this.typingListeners.splice(index, 1);
      }
    };
  }

  public onStatusUser(callback: (status: MessageStatusUserResponse) => void) {
    this.statusUserListeners.push(callback);
    return () => {
      const index = this.statusUserListeners.indexOf(callback);
      if (index > -1) {
        this.statusUserListeners.splice(index, 1);
      }
    };
  }

  public onAudioCall(callback: (notification: AudioCallNotification) => void) {
    this.audioCallListeners.push(callback);
    return () => {
      const index = this.audioCallListeners.indexOf(callback);
      if (index > -1) {
        this.audioCallListeners.splice(index, 1);
      }
    };
  }

  public sendMessage(conversationId: string, message: any) {
    if (!this.stompClient || !this.isConnected) {
      console.warn("WebSocket not connected");
      return;
    }

    this.stompClient.publish({
      destination: `/app/conversations/${conversationId}/messages`,
      body: JSON.stringify(message),
    });
  }

  public sendTyping(conversationId: string, typingData: MessageTypingResponse) {
    if (!this.stompClient || !this.isConnected) {
      console.warn("WebSocket not connected");
      return;
    }

    this.stompClient.publish({
      destination: `/app/conversations/${conversationId}/typing`,
      body: JSON.stringify(typingData),
    });
  }

  public sendUserStatus(userId: string, isOnline: boolean) {
    if (!this.stompClient || !this.isConnected) {
      console.warn("WebSocket not connected");
      return;
    }

    const destination = isOnline
      ? `/app/conversations/${userId}/status/online`
      : `/app/conversations/${userId}/status/offline`;

    this.stompClient.publish({
      destination,
      body: JSON.stringify({ userId, online: isOnline }),
    });
  }

  public disconnect() {
    if (this.stompClient) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions = [];
      this.stompClient.deactivate();
      this.isConnected = false;
    }
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
