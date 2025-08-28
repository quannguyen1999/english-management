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
  private sdpUpdateListeners: Map<string, (data: any) => void> = new Map();
  private iceCandidateListeners: Map<string, (data: any) => void> = new Map();
  private connectionAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private pendingSubscriptions: Array<{ method: string; args: any[] }> = [];
  private isConnecting = false; // Prevent multiple simultaneous connection attempts
  private currentUserId: string | null = null; // To store the current user's ID

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

    // Store subscriptions for cleanup
    this.subscriptions.push(
      statusSubscription,
      incomingCallSubscription,
      callAcceptedSubscription,
      callRejectedSubscription,
      callEndedSubscription
    );
  }

  /**
   * Set the current user ID for subscriptions
   */
  public setCurrentUserId(userId: string) {
    this.currentUserId = userId;
    console.log("WebSocket service current user ID set to:", userId);
    console.log("WebSocket connected status:", this.isConnected);
    console.log("STOMP client exists:", !!this.stompClient);
    if (this.stompClient) {
      console.log("STOMP client connected:", this.stompClient.connected);
    }
  }

  /**
   * Subscribe to audio call SDP updates and ICE candidates for a specific call
   */
  public subscribeToCallUpdates(
    callId: string,
    onSdpUpdate?: (data: any) => void,
    onIceCandidate?: (data: any) => void
  ) {
    if (!this.stompClient || !this.isConnected) {
      console.warn("WebSocket not connected, cannot subscribe to call updates");
      return;
    }

    if (!this.currentUserId) {
      console.warn("Current user ID not set, cannot subscribe to call updates");
      return;
    }

    console.log(`Subscribing to call updates for call: ${callId}`);
    console.log(`Current user ID: ${this.currentUserId}`);
    console.log(`WebSocket connected: ${this.isConnected}`);

    // Store callbacks for this call
    if (onSdpUpdate) {
      this.sdpUpdateListeners.set(callId, onSdpUpdate);
      console.log(`SDP update callback registered for call: ${callId}`);
    }
    if (onIceCandidate) {
      this.iceCandidateListeners.set(callId, onIceCandidate);
      console.log(`ICE candidate callback registered for call: ${callId}`);
    }

    // Subscribe to SDP offer updates (user-specific topic)
    const offerTopic = `/topic/user/${this.currentUserId}/call-offer`;
    console.log(`Subscribing to offer topic: ${offerTopic}`);
    const offerSubscription = this.stompClient.subscribe(
      offerTopic,
      (message) => {
        try {
          console.log("Raw offer message received:", message);
          const offerData = JSON.parse(message.body);
          console.log("SDP offer received via WebSocket:", offerData);
          // Forward to registered callback
          const callback = this.sdpUpdateListeners.get(callId);
          if (callback) {
            console.log(`Calling SDP update callback for call: ${callId}`);
            callback({ type: "offer", ...offerData });
          } else {
            console.warn(`No SDP update callback found for call: ${callId}`);
          }
        } catch (error) {
          console.error("Error parsing SDP offer message:", error);
        }
      }
    );

    // Subscribe to SDP answer updates (user-specific topic)
    const answerTopic = `/topic/user/${this.currentUserId}/call-answer`;
    console.log(`Subscribing to answer topic: ${answerTopic}`);
    const answerSubscription = this.stompClient.subscribe(
      answerTopic,
      (message) => {
        try {
          console.log("Raw answer message received:", message);
          const answerData = JSON.parse(message.body);
          console.log("SDP answer received via WebSocket:", answerData);
          // Forward to registered callback
          const callback = this.sdpUpdateListeners.get(callId);
          if (callback) {
            console.log(`Calling SDP update callback for call: ${callId}`);
            callback({ type: "answer", ...answerData });
          } else {
            console.warn(`No SDP update callback found for call: ${callId}`);
          }
        } catch (error) {
          console.error("Error parsing SDP answer message:", error);
        }
      }
    );

    // Subscribe to ICE candidate updates (user-specific topic)
    const iceTopic = `/topic/user/${this.currentUserId}/ice-candidate`;
    console.log(`Subscribing to ICE candidate topic: ${iceTopic}`);
    const iceCandidateSubscription = this.stompClient.subscribe(
      iceTopic,
      (message) => {
        try {
          console.log("Raw ICE candidate message received:", message);
          const candidateData = JSON.parse(message.body);
          console.log("ICE candidate received via WebSocket:", candidateData);
          // Forward to registered callback
          const callback = this.iceCandidateListeners.get(callId);
          if (callback) {
            console.log(`Calling ICE candidate callback for call: ${callId}`);
            callback(candidateData);
          } else {
            console.warn(`No ICE candidate callback found for call: ${callId}`);
          }
        } catch (error) {
          console.error("Error parsing ICE candidate message:", error);
        }
      }
    );

    // Store subscriptions for cleanup
    this.subscriptions.push(
      offerSubscription,
      answerSubscription,
      iceCandidateSubscription
    );

    console.log(`Subscribed to call updates for call: ${callId}`);
    console.log(`Total subscriptions: ${this.subscriptions.length}`);
  }

  /**
   * Unsubscribe from call updates for a specific call
   */
  public unsubscribeFromCallUpdates(callId: string) {
    console.log(`Unsubscribing from call updates for call: ${callId}`);

    // Remove callbacks for this call
    this.sdpUpdateListeners.delete(callId);
    this.iceCandidateListeners.delete(callId);

    // Remove subscriptions for this call (user-specific topics)
    this.subscriptions = this.subscriptions.filter((sub) => {
      const destination = (sub as any).destination;
      if (
        destination &&
        (destination.includes(`/user/${this.currentUserId}/call-offer`) ||
          destination.includes(`/user/${this.currentUserId}/call-answer`) ||
          destination.includes(`/user/${this.currentUserId}/ice-candidate`))
      ) {
        sub.unsubscribe();
        return false; // Remove from array
      }
      return true; // Keep in array
    });
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
