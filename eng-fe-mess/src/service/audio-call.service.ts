import { CHAT_API } from "../config";
import websocketService from "./websocket.service";

export interface AudioCallRequest {
  conversationId: string;
  targetUserId: string;
  callType: "AUDIO" | "VIDEO";
  offerSdp?: string;
  answerSdp?: string;
  iceCandidate?: string;
}

export interface AudioCallResponse {
  callId: string;
  conversationId: string;
  callerId: string;
  calleeId: string;
  callType: string;
  status: string;
  offerSdp?: string;
  answerSdp?: string;
  initiatedAt: string;
  answeredAt?: string;
  endedAt?: string;
  duration?: number;
}

export interface IncomingCallNotification {
  type: "INCOMING_CALL";
  data: AudioCallResponse;
}

export interface CallAcceptedNotification {
  type: "CALL_ACCEPTED";
  data: AudioCallResponse;
}

export interface CallRejectedNotification {
  type: "CALL_REJECTED";
  data: AudioCallResponse;
}

export interface CallEndedNotification {
  type: "CALL_ENDED";
  data: AudioCallResponse;
}

export type AudioCallNotification =
  | IncomingCallNotification
  | CallAcceptedNotification
  | CallRejectedNotification
  | CallEndedNotification;

class AudioCallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private isInitiator: boolean = false;
  private isInitialized: boolean = false;
  private currentUserId: string | null = null;
  private pendingOffer: RTCSessionDescriptionInit | null = null;
  private pendingAnswer: RTCSessionDescriptionInit | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Only initialize if we're in a browser environment
    if (
      typeof window !== "undefined" &&
      typeof RTCPeerConnection !== "undefined"
    ) {
      this.initializePeerConnection();
      this.isInitialized = true;
      this.setupWebSocketListeners();
    }
  }

  private setupWebSocketListeners() {
    console.log("Setting up WebSocket listeners for audio call service");

    // Listen for incoming call notifications
    websocketService.onAudioCall((notification: AudioCallNotification) => {
      console.log("Audio call notification received:", notification);

      switch (notification.type) {
        case "INCOMING_CALL":
          this.handleIncomingCall(notification.data);
          break;
        case "CALL_ACCEPTED":
          this.handleCallAccepted(notification.data);
          break;
        case "CALL_REJECTED":
          this.handleCallRejected(notification.data);
          break;
        case "CALL_ENDED":
          this.handleCallEnded(notification.data);
          break;
        default:
          // TypeScript exhaustive check
          const _exhaustiveCheck: never = notification;
          console.log("Unknown notification type:", notification);
      }
    });
  }

  private async handleIncomingCall(callData: AudioCallResponse) {
    console.log("Handling incoming call:", callData);

    // Store the pending offer
    if (callData.offerSdp) {
      console.log("Storing pending offer:", callData.offerSdp);
      this.pendingOffer = {
        type: "offer",
        sdp: callData.offerSdp,
      };
    } else {
      console.warn("No offer SDP in incoming call data");
    }

    this.currentCallId = callData.callId;
    this.isInitiator = false;

    // Trigger callback for UI to show incoming call
    this.onIncomingCall?.(callData);
    console.log("Incoming call callback triggered");
  }

  private async handleCallAccepted(callData: AudioCallResponse) {
    console.log("Call accepted:", callData);

    if (callData.answerSdp && this.isInitiator) {
      console.log("Setting remote answer from call data:", callData.answerSdp);
      try {
        await this.setRemoteDescription({
          type: "answer",
          sdp: callData.answerSdp,
        });
        console.log("Remote answer set successfully");
      } catch (error) {
        console.error("Error setting remote answer:", error);
      }
    } else {
      console.log("No answer SDP in call data or not initiator");
    }

    this.onCallAccepted?.(callData);
  }

  private async handleCallRejected(callData: AudioCallResponse) {
    console.log("Call rejected:", callData);
    this.cleanup();
    this.onCallRejected?.(callData);
  }

  private async handleCallEnded(callData: AudioCallResponse) {
    console.log("Call ended notification received:", callData);

    // Check if this is actually our current call
    if (callData.callId !== this.currentCallId) {
      console.log("Call ended notification is for a different call, ignoring");
      return;
    }

    // Check call health before ending
    if (this.checkCallHealth()) {
      console.log("Call is still healthy, ignoring premature end notification");
      return;
    }

    console.log("Call is actually ended, cleaning up");
    this.cleanup();
    this.onCallEnded?.(callData);
  }

  private async handleCallUpdate(updateData: any) {
    console.log("Call update received:", updateData);

    if (updateData.callId === this.currentCallId) {
      if (updateData.offerSdp && !this.isInitiator) {
        // Set remote offer
        try {
          await this.setRemoteDescription({
            type: "offer",
            sdp: updateData.offerSdp,
          });
        } catch (error) {
          console.error("Error setting remote offer:", error);
        }
      } else if (updateData.answerSdp && this.isInitiator) {
        // Set remote answer
        try {
          await this.setRemoteDescription({
            type: "answer",
            sdp: updateData.answerSdp,
          });
        } catch (error) {
          console.error("Error setting remote answer:", error);
        }
      }
    }
  }

  private async handleIceCandidate(candidateData: any) {
    console.log("ICE candidate received:", candidateData);

    if (candidateData.callId === this.currentCallId && this.peerConnection) {
      try {
        await this.peerConnection.addIceCandidate(candidateData.candidate);
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  }

  private initializePeerConnection() {
    // Check if WebRTC is available
    if (typeof RTCPeerConnection === "undefined") {
      console.warn("WebRTC is not available in this environment");
      return;
    }

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
      iceCandidatePoolSize: 10,
    };

    try {
      this.peerConnection = new RTCPeerConnection(configuration);

      // Handle incoming tracks
      this.peerConnection.ontrack = (event) => {
        console.log("=== ONTRACK EVENT TRIGGERED ===");
        console.log("Event:", event);
        console.log("Streams:", event.streams);
        console.log("Track:", event.track);
        console.log("Track kind:", event.track.kind);
        console.log("Track enabled:", event.track.enabled);
        console.log("Track muted:", event.track.muted);
        console.log("Track readyState:", event.track.readyState);

        if (event.streams && event.streams.length > 0) {
          console.log("Setting remote stream:", event.streams[0]);
          this.remoteStream = event.streams[0];

          // Log stream details
          console.log("Remote stream tracks:", this.remoteStream.getTracks());
          this.remoteStream.getTracks().forEach((track, index) => {
            console.log(`Track ${index}:`, {
              kind: track.kind,
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState,
              id: track.id,
            });
          });

          // Trigger callback
          this.onRemoteStreamReceived?.(this.remoteStream);
          console.log("Remote stream callback triggered");
        } else {
          console.warn("No streams in ontrack event");
        }
        console.log("=== END ONTRACK EVENT ===");
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("ICE candidate generated:", event.candidate);
          this.onIceCandidateReceived?.(event.candidate);

          // Send ICE candidate to the other peer via WebSocket
          if (this.currentCallId) {
            this.sendIceCandidate(event.candidate);
          }
        } else {
          console.log("ICE candidate gathering completed");
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log(
          "Connection state changed:",
          this.peerConnection?.connectionState
        );
        if (this.peerConnection?.connectionState === "connected") {
          console.log("WebRTC connection established successfully!");
          this.onCallConnected?.();
        } else if (this.peerConnection?.connectionState === "disconnected") {
          console.log("WebRTC connection disconnected");
          this.onCallDisconnected?.();
        } else if (this.peerConnection?.connectionState === "failed") {
          console.error("WebRTC connection failed");
          // Don't end the call immediately, let the user decide
        }
      };

      // Handle ICE connection state changes
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log(
          "ICE connection state:",
          this.peerConnection?.iceConnectionState
        );

        if (this.peerConnection?.iceConnectionState === "connected") {
          console.log("ICE connection established!");
        } else if (this.peerConnection?.iceConnectionState === "failed") {
          console.error("ICE connection failed");
        }
      };

      // Handle signaling state changes
      this.peerConnection.onsignalingstatechange = () => {
        console.log("Signaling state:", this.peerConnection?.signalingState);

        if (this.peerConnection?.signalingState === "stable") {
          console.log("Signaling state is stable");
        } else if (this.peerConnection?.signalingState === "have-local-offer") {
          console.log("Local offer set, waiting for remote answer");
        } else if (
          this.peerConnection?.signalingState === "have-remote-offer"
        ) {
          console.log("Remote offer received, need to create answer");
        }
      };

      // Handle negotiation needed
      this.peerConnection.onnegotiationneeded = async () => {
        console.log("Negotiation needed, creating new offer");
        try {
          if (this.isInitiator && this.peerConnection) {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.sendSdpOffer(offer);
          }
        } catch (error) {
          console.error("Error during negotiation:", error);
        }
      };
    } catch (error) {
      console.error("Error initializing WebRTC peer connection:", error);
    }
  }

  // Callbacks
  public onRemoteStreamReceived?: (stream: MediaStream) => void;
  public onIceCandidateReceived?: (candidate: RTCIceCandidate) => void;
  public onCallConnected?: () => void;
  public onCallDisconnected?: () => void;
  public onIncomingCall?: (callData: AudioCallResponse) => void;
  public onCallAccepted?: (callData: AudioCallResponse) => void;
  public onCallRejected?: (callData: AudioCallResponse) => void;
  public onCallEnded?: (callData: AudioCallResponse) => void;

  /**
   * Set the current user ID for WebSocket subscriptions
   */
  public setCurrentUserId(userId: string) {
    console.log("Setting current user ID for audio call service:", userId);
    this.currentUserId = userId;
    // Subscribe to user-specific notifications
    websocketService.subscribeStatusUserOnline(userId);
    console.log(
      "Subscribed to user status and audio call notifications for user:",
      userId
    );
  }

  /**
   * Check if WebRTC is available
   */
  private isWebRTCAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof RTCPeerConnection !== "undefined" &&
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined"
    );
  }

  /**
   * Initiate a new audio call
   */
  async initiateCall(request: AudioCallRequest): Promise<AudioCallResponse> {
    console.log("Initiating audio call with request:", request);

    if (!this.isWebRTCAvailable()) {
      throw new Error("WebRTC is not available in this environment");
    }

    if (!this.isInitialized || !this.peerConnection) {
      console.log("Reinitializing peer connection");
      this.initializePeerConnection();
      this.isInitialized = true;
    }

    try {
      console.log("Getting user media...");
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: request.callType === "VIDEO",
      });
      console.log("User media obtained:", this.localStream);

      // Add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });

      // Create offer
      if (!this.peerConnection) {
        throw new Error("Peer connection not initialized");
      }

      console.log("Creating offer...");
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log("Offer created and set as local description:", offer);

      // Send request to backend
      console.log("Sending request to backend...");
      const response = await fetch(`${CHAT_API}/audio-calls/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          ...request,
          offerSdp: offer.sdp,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate call");
      }

      const callResponse: AudioCallResponse = await response.json();
      console.log("Backend response:", callResponse);

      this.currentCallId = callResponse.callId;
      this.isInitiator = true;

      // Send SDP offer via WebSocket for real-time updates
      console.log("Sending SDP offer via WebSocket...");
      this.sendSdpOffer(offer);

      // Start connection check
      this.startConnectionCheck();

      console.log("Call initiated successfully:", callResponse);
      return callResponse;
    } catch (error) {
      console.error("Error initiating call:", error);
      throw error;
    }
  }

  /**
   * Accept an incoming call
   */
  async acceptCall(callId: string): Promise<AudioCallResponse> {
    console.log("Accepting call:", callId);

    if (!this.isWebRTCAvailable()) {
      throw new Error("WebRTC is not available in this environment");
    }

    if (!this.isInitialized || !this.peerConnection) {
      console.log("Reinitializing peer connection for call acceptance");
      this.initializePeerConnection();
      this.isInitialized = true;
    }

    try {
      console.log("Getting user media for call acceptance...");
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false, // For now, only audio calls
      });
      console.log("User media obtained for call acceptance:", this.localStream);

      // Add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
          console.log("Added track to peer connection:", track.kind);
        }
      });

      // Set remote description (offer from caller)
      if (!this.peerConnection) {
        throw new Error("Peer connection not initialized");
      }

      if (this.pendingOffer) {
        console.log("Setting remote offer from pending offer");
        await this.peerConnection.setRemoteDescription(this.pendingOffer);
        this.pendingOffer = null;
      } else {
        console.warn("No pending offer to accept");
        throw new Error("No pending offer to accept");
      }

      // Create answer
      console.log("Creating answer for call acceptance...");
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log("Answer created and set as local description:", answer);

      // Send accept request to backend
      console.log("Sending accept request to backend...");
      const response = await fetch(`${CHAT_API}/audio-calls/${callId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          answerSdp: answer.sdp,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept call");
      }

      const callResponse: AudioCallResponse = await response.json();
      console.log("Backend accept response:", callResponse);

      this.currentCallId = callId;
      this.isInitiator = false;

      // Send SDP answer via WebSocket for real-time updates
      console.log("Sending SDP answer via WebSocket...");
      this.sendSdpAnswer(answer);

      // Start connection check
      this.startConnectionCheck();

      console.log("Call accepted successfully:", callResponse);
      return callResponse;
    } catch (error) {
      console.error("Error accepting call:", error);
      throw error;
    }
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: string): Promise<AudioCallResponse> {
    try {
      const response = await fetch(`${CHAT_API}/audio-calls/${callId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to reject call");
      }

      const result = await response.json();
      this.cleanup();
      return result;
    } catch (error) {
      console.error("Error rejecting call:", error);
      throw error;
    }
  }

  /**
   * End the current call
   */
  async endCall(): Promise<AudioCallResponse> {
    if (!this.currentCallId) {
      throw new Error("No active call to end");
    }

    try {
      const response = await fetch(
        `${CHAT_API}/audio-calls/${this.currentCallId}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to end call");
      }

      const callResponse = await response.json();
      this.cleanup();
      return callResponse;
    } catch (error) {
      console.error("Error ending call:", error);
      throw error;
    }
  }

  /**
   * Send ICE candidate via WebSocket
   */
  private sendIceCandidate(candidate: RTCIceCandidate) {
    if (!this.currentCallId || !websocketService.isWebSocketConnected()) {
      return;
    }

    try {
      websocketService.stompClient?.publish({
        destination: `/app/audio-calls/${this.currentCallId}/ice-candidate`,
        body: JSON.stringify(candidate),
      });
    } catch (error) {
      console.error("Error sending ICE candidate:", error);
    }
  }

  /**
   * Send SDP offer update via WebSocket
   */
  private sendSdpOffer(offer: RTCSessionDescriptionInit) {
    if (!this.currentCallId || !websocketService.isWebSocketConnected()) {
      console.error(
        "Cannot send SDP offer: no call ID or WebSocket not connected"
      );
      return;
    }

    try {
      const destination = `/app/audio-calls/${this.currentCallId}/offer`;
      const messageBody = JSON.stringify({
        // Remove callId - backend doesn't expect it
        offerSdp: offer.sdp,
        // Add required fields that backend expects
        targetUserId: "", // This will be set by backend
        callType: "AUDIO",
        conversationId: "", // This will be set by backend
      });

      console.log("Sending SDP offer via WebSocket:");
      console.log("  Destination:", destination);
      console.log("  Message body:", messageBody);
      console.log(
        "  WebSocket connected:",
        websocketService.isWebSocketConnected()
      );
      console.log("  STOMP client:", websocketService.stompClient);

      websocketService.stompClient?.publish({
        destination,
        body: messageBody,
      });

      console.log("SDP offer sent successfully via WebSocket");
    } catch (error) {
      console.error("Error sending SDP offer via WebSocket:", error);
    }
  }

  /**
   * Send SDP answer update via WebSocket
   */
  private sendSdpAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.currentCallId || !websocketService.isWebSocketConnected()) {
      console.error(
        "Cannot send SDP answer: no call ID or WebSocket not connected"
      );
      return;
    }

    try {
      const destination = `/app/audio-calls/${this.currentCallId}/answer`;
      const messageBody = JSON.stringify({
        // Remove callId - backend doesn't expect it
        answerSdp: answer.sdp,
        // Add required fields that backend expects
        targetUserId: "", // This will be set by backend
        callType: "AUDIO",
        conversationId: "", // This will be set by backend
      });

      console.log("Sending SDP answer via WebSocket:");
      console.log("  Destination:", destination);
      console.log("  Message body:", messageBody);
      console.log(
        "  WebSocket connected:",
        websocketService.isWebSocketConnected()
      );
      console.log("  STOMP client:", websocketService.stompClient);

      websocketService.stompClient?.publish({
        destination,
        body: messageBody,
      });

      console.log("SDP answer sent successfully via WebSocket");
    } catch (error) {
      console.error("Error sending SDP answer via WebSocket:", error);
    }
  }

  /**
   * Set remote description (offer or answer from peer)
   */
  async setRemoteDescription(
    description: RTCSessionDescriptionInit
  ): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    console.log("=== SETTING REMOTE DESCRIPTION ===");
    console.log("Description type:", description.type);
    console.log("Description SDP:", description.sdp);
    console.log("Current signaling state:", this.peerConnection.signalingState);

    try {
      await this.peerConnection.setRemoteDescription(description);
      console.log("Remote description set successfully");
      console.log("New signaling state:", this.peerConnection.signalingState);
      console.log("=== END SETTING REMOTE DESCRIPTION ===");
    } catch (error) {
      console.error("Error setting remote description:", error);
      console.log("=== END SETTING REMOTE DESCRIPTION (ERROR) ===");
      throw error;
    }
  }

  /**
   * Add ICE candidate from peer
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    console.log("=== ADDING ICE CANDIDATE ===");
    console.log("Candidate:", candidate);
    console.log(
      "Current ICE connection state:",
      this.peerConnection.iceConnectionState
    );

    try {
      await this.peerConnection.addIceCandidate(candidate);
      console.log("ICE candidate added successfully");
      console.log(
        "New ICE connection state:",
        this.peerConnection.iceConnectionState
      );
      console.log("=== END ADDING ICE CANDIDATE ===");
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
      console.log("=== END ADDING ICE CANDIDATE (ERROR) ===");
      throw error;
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Check if call is active
   */
  isCallActive(): boolean {
    return this.currentCallId !== null;
  }

  /**
   * Get current call ID
   */
  getCurrentCallId(): string | null {
    return this.currentCallId;
  }

  /**
   * Check if user is the initiator of the current call
   */
  isCallInitiator(): boolean {
    return this.isInitiator;
  }

  /**
   * Cleanup resources
   */
  private cleanup() {
    // Stop connection check
    this.stopConnectionCheck();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.currentCallId = null;
    this.isInitiator = false;
    this.isInitialized = false;
    this.pendingOffer = null;
    this.pendingAnswer = null;

    // Reinitialize peer connection for future calls
    if (this.isWebRTCAvailable()) {
      this.initializePeerConnection();
      this.isInitialized = true;
    }
  }

  /**
   * Check call health and prevent premature termination
   */
  private checkCallHealth(): boolean {
    if (!this.peerConnection) {
      console.warn("No peer connection available");
      return false;
    }

    const connectionState = this.peerConnection.connectionState;
    const iceConnectionState = this.peerConnection.iceConnectionState;
    const signalingState = this.peerConnection.signalingState;

    console.log("Call health check:", {
      connectionState,
      iceConnectionState,
      signalingState,
      hasLocalStream: !!this.localStream,
      hasRemoteStream: !!this.remoteStream,
      currentCallId: this.currentCallId,
    });

    // Don't end call if we're still establishing connection
    if (connectionState === "connecting" || iceConnectionState === "checking") {
      console.log("Call is still establishing connection, don't end");
      return true;
    }

    // Don't end call if we have a stable connection
    if (connectionState === "connected" && iceConnectionState === "connected") {
      console.log("Call has stable connection");
      return true;
    }

    // Don't end call if we're still in signaling phase
    if (
      signalingState === "have-local-offer" ||
      signalingState === "have-remote-offer"
    ) {
      console.log("Call is still in signaling phase, don't end");
      return true;
    }

    return false;
  }

  /**
   * Force cleanup (for emergency situations)
   */
  forceCleanup() {
    console.log("Force cleaning up audio call service");
    this.cleanup();
  }

  /**
   * Handle incoming SDP update (offer or answer)
   */
  public handleIncomingSdpUpdate(updateData: {
    callId: string;
    offerSdp?: string;
    answerSdp?: string;
  }) {
    console.log("SDP update received:", updateData);

    if (updateData.callId !== this.currentCallId || !this.peerConnection) {
      console.log("SDP update ignored - wrong call ID or no peer connection");
      return;
    }

    if (updateData.offerSdp && !this.isInitiator) {
      console.log("Handling incoming offer as callee");
      // Handle incoming offer from caller
      this.setRemoteDescription({
        type: "offer",
        sdp: updateData.offerSdp,
      })
        .then(() => {
          console.log("Remote offer set successfully, creating answer");
          // Create and send answer
          return this.peerConnection!.createAnswer();
        })
        .then((answer) => {
          console.log("Answer created, setting as local description");
          return this.peerConnection!.setLocalDescription(answer).then(
            () => answer
          );
        })
        .then((answer) => {
          console.log("Answer set as local description, sending via WebSocket");
          this.sendSdpAnswer(answer);
        })
        .catch((error) => {
          console.error("Error handling incoming offer:", error);
        });
    } else if (updateData.answerSdp && this.isInitiator) {
      console.log("Handling incoming answer as caller");
      // Handle incoming answer from callee
      this.setRemoteDescription({
        type: "answer",
        sdp: updateData.answerSdp,
      })
        .then(() => {
          console.log("Remote answer set successfully");
        })
        .catch((error) => {
          console.error("Error handling incoming answer:", error);
        });
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  public handleIncomingIceCandidate(candidateData: {
    callId: string;
    candidate: RTCIceCandidateInit;
  }) {
    if (candidateData.callId !== this.currentCallId || !this.peerConnection) {
      return;
    }

    this.peerConnection
      .addIceCandidate(candidateData.candidate)
      .catch((error) => {
        console.error("Error adding ICE candidate:", error);
      });
  }

  /**
   * Manually check and establish WebRTC connection
   */
  public async establishConnection(): Promise<boolean> {
    if (!this.peerConnection || !this.currentCallId) {
      console.warn(
        "Cannot establish connection: no peer connection or call ID"
      );
      return false;
    }

    try {
      console.log("Manually establishing WebRTC connection...");

      // Check current state
      const connectionState = this.peerConnection.connectionState;
      const iceConnectionState = this.peerConnection.iceConnectionState;
      const signalingState = this.peerConnection.signalingState;

      console.log("Current connection state:", {
        connectionState,
        iceConnectionState,
        signalingState,
      });

      // If we're already connected, return true
      if (
        connectionState === "connected" &&
        iceConnectionState === "connected"
      ) {
        console.log("Connection already established");
        return true;
      }

      // If we need to create an offer (initiator)
      if (this.isInitiator && signalingState === "stable") {
        console.log("Creating new offer as initiator");
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.sendSdpOffer(offer);
        return true;
      }

      // If we need to create an answer (callee)
      if (!this.isInitiator && signalingState === "have-remote-offer") {
        console.log("Creating answer as callee");
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.sendSdpAnswer(answer);
        return true;
      }

      console.log("Connection establishment not needed or not possible");
      return false;
    } catch (error) {
      console.error("Error establishing connection:", error);
      return false;
    }
  }

  /**
   * Start periodic connection check
   */
  private startConnectionCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    this.connectionCheckInterval = setInterval(async () => {
      if (this.currentCallId && this.peerConnection) {
        const isHealthy = this.checkCallHealth();
        if (!isHealthy) {
          console.log(
            "Call health check failed, attempting to re-establish connection"
          );
          await this.establishConnection();
        }
      } else {
        // No active call, stop checking
        this.stopConnectionCheck();
      }
    }, 5000); // Check every 5 seconds

    console.log("Started connection check interval");
  }

  /**
   * Stop periodic connection check
   */
  private stopConnectionCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
      console.log("Stopped connection check interval");
    }
  }

  /**
   * Manually trigger connection establishment (can be called from UI)
   */
  public async reconnect(): Promise<boolean> {
    console.log("Manual reconnection requested");
    if (!this.currentCallId) {
      console.warn("No active call to reconnect");
      return false;
    }

    return await this.establishConnection();
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    connectionState: string;
    iceConnectionState: string;
    signalingState: string;
    hasLocalStream: boolean;
    hasRemoteStream: boolean;
    isCallActive: boolean;
  } {
    if (!this.peerConnection) {
      return {
        connectionState: "disconnected",
        iceConnectionState: "disconnected",
        signalingState: "closed",
        hasLocalStream: !!this.localStream,
        hasRemoteStream: !!this.remoteStream,
        isCallActive: this.isCallActive(),
      };
    }

    return {
      connectionState: this.peerConnection.connectionState,
      iceConnectionState: this.peerConnection.iceConnectionState,
      signalingState: this.peerConnection.signalingState,
      hasLocalStream: !!this.localStream,
      hasRemoteStream: !!this.remoteStream,
      isCallActive: this.isCallActive(),
    };
  }

  /**
   * Manually trigger SDP exchange (for testing)
   */
  public async triggerSdpExchange(): Promise<void> {
    if (!this.currentCallId || !this.peerConnection) {
      console.warn(
        "Cannot trigger SDP exchange: no active call or peer connection"
      );
      return;
    }

    try {
      console.log("Manually triggering SDP exchange...");

      if (this.isInitiator) {
        // As initiator, create a new offer
        console.log("Creating new offer as initiator");
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.sendSdpOffer(offer);
        console.log("New offer sent via WebSocket");
      } else {
        // As callee, check if we have a remote offer and create answer
        if (
          this.peerConnection.remoteDescription &&
          this.peerConnection.remoteDescription.type === "offer"
        ) {
          console.log("Creating answer as callee");
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.sendSdpAnswer(answer);
          console.log("Answer sent via WebSocket");
        } else {
          console.warn("No remote offer available to answer");
        }
      }
    } catch (error) {
      console.error("Error during manual SDP exchange:", error);
    }
  }

  /**
   * Debug WebSocket connection and subscription status
   */
  public debugWebSocketStatus(): void {
    console.log("=== WebSocket Debug Info ===");
    console.log(
      "WebSocket connected:",
      websocketService.isWebSocketConnected()
    );
    console.log("STOMP client exists:", !!websocketService.stompClient);
    console.log("Current user ID:", this.currentUserId);
    console.log("Current call ID:", this.currentCallId);

    if (websocketService.stompClient) {
      console.log(
        "STOMP client state:",
        websocketService.stompClient.connected
      );
    }

    if (this.peerConnection) {
      console.log(
        "Peer connection state:",
        this.peerConnection.connectionState
      );
      console.log(
        "ICE connection state:",
        this.peerConnection.iceConnectionState
      );
      console.log("Signaling state:", this.peerConnection.signalingState);
      console.log("Local description:", this.peerConnection.localDescription);
      console.log("Remote description:", this.peerConnection.remoteDescription);
    }

    console.log("===========================");
  }
}

// Export singleton instance only in browser environment
let audioCallService: AudioCallService | null = null;

if (typeof window !== "undefined") {
  audioCallService = new AudioCallService();
}

export { audioCallService };
export default audioCallService;
