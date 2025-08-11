import { Client } from "@stomp/stompjs";
import { CHAT_API } from "../config";
import {
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

    this.connectionAttempts++;

    if (this.connectionAttempts <= this.MAX_RECONNECT_ATTEMPTS) {
      console.log(
        `Attempting to reconnect (attempt ${this.connectionAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`
      );
      setTimeout(() => {
        this.connect();
      }, 5000);
    } else {
      console.error(
        "Max reconnection attempts reached. Please refresh the page to try again."
      );
    }
  }

  private processPendingSubscriptions() {
    console.log(
      "Processing pending subscriptions:",
      this.pendingSubscriptions.length
    );

    while (this.pendingSubscriptions.length > 0) {
      const pending = this.pendingSubscriptions.shift();
      if (pending) {
        try {
          switch (pending.method) {
            case "subscribeToConversation":
              if (pending.args[0]) {
                this.subscribeToConversation(pending.args[0]);
              }
              break;
            case "subscribeToTyping":
              if (pending.args[0]) {
                this.subscribeToTyping(pending.args[0]);
              }
              break;
            case "subscribeStatusUserOnline":
              if (pending.args[0]) {
                this.subscribeStatusUserOnline(pending.args[0]);
              }
              break;
            default:
              console.warn(
                "Unknown pending subscription method:",
                pending.method
              );
          }
        } catch (error) {
          console.error("Error processing pending subscription:", error);
        }
      }
    }
  }

  public subscribeToConversation(conversationId: string) {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.log(
        "WebSocket not connected, queuing subscription for conversation:",
        conversationId
      );
      // Check if subscription is already queued to prevent duplicates
      const alreadyQueued = this.pendingSubscriptions.some(
        (sub) =>
          sub.method === "subscribeToConversation" &&
          sub.args[0] === conversationId
      );
      if (!alreadyQueued) {
        this.pendingSubscriptions.push({
          method: "subscribeToConversation",
          args: [conversationId],
        });
      }
      return;
    }

    // Unsubscribe from existing subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];

    // Subscribe to conversation messages
    this.subscribeWithRetry(
      `/topic/conversations/${conversationId}`,
      (message) => {
        try {
          const messageData = JSON.parse(message.body);
          this.notifyMessageListeners(messageData);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }
    );
  }

  private subscribeWithRetry(
    destination: string,
    callback: (message: any) => void
  ) {
    try {
      const subscription = this.stompClient?.subscribe(destination, callback, {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      });
      if (subscription) {
        this.subscriptions.push(subscription);
      }
    } catch (error) {
      console.error(`Failed to subscribe to ${destination}:`, error);
    }
  }

  public subscribeToTyping(conversationId: string) {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.log(
        "WebSocket not connected, queuing typing subscription for conversation:",
        conversationId
      );
      // Check if subscription is already queued to prevent duplicates
      const alreadyQueued = this.pendingSubscriptions.some(
        (sub) =>
          sub.method === "subscribeToTyping" && sub.args[0] === conversationId
      );
      if (!alreadyQueued) {
        this.pendingSubscriptions.push({
          method: "subscribeToTyping",
          args: [conversationId],
        });
      }
      return;
    }

    return this.subscribeWithRetry(
      `/topic/conversations/${conversationId}/typing`,
      (data) => {
        try {
          const convert = JSON.parse(data.body);
          this.notifyTypingListeners(convert);
        } catch (error) {
          console.error("Error parsing typing message:", error);
        }
      }
    );
  }

  public subscribeStatusUserOnline(userId: string) {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.log(
        "WebSocket not connected, queuing status subscription for user:",
        userId
      );
      // Check if subscription is already queued to prevent duplicates
      const alreadyQueued = this.pendingSubscriptions.some(
        (sub) =>
          sub.method === "subscribeStatusUserOnline" && sub.args[0] === userId
      );
      if (!alreadyQueued) {
        this.pendingSubscriptions.push({
          method: "subscribeStatusUserOnline",
          args: [userId],
        });
      }
      return;
    }

    return this.subscribeWithRetry(`/topic/user/${userId}/status`, (data) => {
      try {
        const convert = JSON.parse(data.body);
        this.notifyStatusUserListeners(convert);
      } catch (error) {
        console.error("Error parsing status message:", error);
      }
    });
  }

  public publishStatusUser(userId: string, online: boolean) {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.error("Cannot publish: WebSocket is not connected");
      return;
    }

    if (online) {
      this.stompClient?.publish({
        destination: `/app/conversations/${userId}/status/online`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    } else {
      this.stompClient?.publish({
        destination: `/app/conversations/${userId}/status/offline`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    }
  }

  public publishTyping(conversationId: string, payload: Object) {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.error("Cannot publish: WebSocket is not connected");
      return;
    }

    this.stompClient?.publish({
      destination: `/app/conversations/${conversationId}/typing`,
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  }

  public sendMessage(message: Partial<Message>): void {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.error("Cannot send message: WebSocket is not connected");
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/conversations/${message.conversationId}/send`,
        body: JSON.stringify(message),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  public markAsRead(messageId: string, conversationId: string): void {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.error("Cannot mark as read: WebSocket is not connected");
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/conversations/${conversationId}/messages/${messageId}/read`,
        body: JSON.stringify({ messageId, conversationId }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }

  public markAsDelivered(messageId: string, conversationId: string): void {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.error("Cannot mark as delivered: WebSocket is not connected");
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/conversations/${conversationId}/messages/${messageId}/delivered`,
        body: JSON.stringify({ messageId, conversationId }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    } catch (error) {
      console.error("Error marking message as delivered:", error);
    }
  }

  public addReaction(
    messageId: string,
    conversationId: string,
    reaction: string
  ): void {
    if (!this.isConnected || !this.stompClient?.connected) {
      console.error("Cannot add reaction: WebSocket is not connected");
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/conversations/${conversationId}/messages/${messageId}/reaction`,
        body: JSON.stringify({ messageId, conversationId, reaction }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  }

  // Event listener methods for React components
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

  private notifyMessageListeners(message: Message) {
    this.messageListeners.forEach((callback) => callback(message));
  }

  private notifyTypingListeners(typing: MessageTypingResponse) {
    this.typingListeners.forEach((callback) => callback(typing));
  }

  private notifyStatusUserListeners(status: MessageStatusUserResponse) {
    this.statusUserListeners.forEach((callback) => callback(status));
  }

  public disconnect(): void {
    if (this.stompClient) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions = [];
      this.stompClient.deactivate();
      this.stompClient = null;
    }

    this.isConnected = false;
    this.isConnecting = false;

    // Clear all listeners
    this.messageListeners = [];
    this.typingListeners = [];
    this.statusUserListeners = [];
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && this.stompClient?.connected === true;
  }

  public connectWithToken(token: string) {
    if (token && !this.isConnected && !this.isConnecting) {
      localStorage.setItem("access_token", token);
      this.connect();
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
