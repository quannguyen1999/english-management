"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import audioCallService, {
  AudioCallResponse,
} from "@/service/audio-call.service";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ActiveCallProps {
  call: AudioCallResponse;
  onCallEnded: () => void;
}

export function ActiveCall({ call, onCallEnded }: ActiveCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set up local audio stream
    const localStream = audioCallService?.getLocalStream();
    if (localStream && localAudioRef.current) {
      localAudioRef.current.srcObject = localStream;
    }

    // Set up remote audio stream
    const remoteStream = audioCallService?.getRemoteStream();
    if (remoteStream && remoteAudioRef.current) {
      console.log("Setting up remote audio stream:", remoteStream);
      remoteAudioRef.current.srcObject = remoteStream;
      // Ensure the audio element is playing
      remoteAudioRef.current.play().catch((error) => {
        console.error("Error playing remote audio:", error);
      });
    } else {
      console.log("No remote stream available yet or no audio element");
    }

    // Start call duration timer
    const startTime = new Date(call.answeredAt || call.initiatedAt);
    durationIntervalRef.current = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setCallDuration(duration);
    }, 1000);

    // Set up call event listeners
    if (audioCallService) {
      audioCallService.onCallConnected = () => {
        console.log("Call connected");
      };

      audioCallService.onCallDisconnected = () => {
        console.log("Call disconnected");
        onCallEnded();
      };

      // Set up remote stream received callback
      audioCallService.onRemoteStreamReceived = (remoteStream: MediaStream) => {
        console.log("Remote stream received in ActiveCall:", remoteStream);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          // Ensure the audio element is playing
          remoteAudioRef.current.play().catch((error) => {
            console.error("Error playing remote audio:", error);
          });
        }
      };
    }

    // Start connection status check
    statusCheckIntervalRef.current = setInterval(() => {
      if (audioCallService) {
        const status = audioCallService.getConnectionStatus();
        setConnectionStatus(status);
      }
    }, 2000);

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [call, onCallEnded]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndCall = async () => {
    setIsLoading(true);
    try {
      if (audioCallService) {
        await audioCallService.endCall();
      }
      onCallEnded();
    } catch (error) {
      console.error("Error ending call:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = async () => {
    if (!audioCallService) return;

    setIsReconnecting(true);
    try {
      const success = await audioCallService.reconnect();
      if (success) {
        console.log("Reconnection successful");
      } else {
        console.log("Reconnection failed");
      }
    } catch (error) {
      console.error("Error during reconnection:", error);
    } finally {
      setIsReconnecting(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioCallService) {
      const localStream = audioCallService.getLocalStream();
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted;
        });
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Implement speaker logic if needed
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isSpeakerOn;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Active Call</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Call Info */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Call in Progress</h3>
          <p className="text-sm text-muted-foreground">
            Duration: {formatDuration(callDuration)}
          </p>
          <p className="text-sm text-muted-foreground">Type: {call.callType}</p>
        </div>

        {/* Audio Elements */}
        <audio
          ref={localAudioRef}
          autoPlay
          muted
          playsInline
          style={{ display: "none" }}
        />
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          controls
          style={{ display: "block", width: "100%", marginTop: "1rem" }}
        />

        {/* Call Controls */}
        <div className="flex justify-center space-x-4">
          {/* Mute Button */}
          <Button
            onClick={toggleMute}
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            className="w-14 h-14 rounded-full"
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {/* End Call Button */}
          <Button
            onClick={handleEndCall}
            disabled={isLoading}
            variant="destructive"
            size="lg"
            className="w-14 h-14 rounded-full"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {/* Speaker Button */}
          <Button
            onClick={toggleSpeaker}
            variant={isSpeakerOn ? "outline" : "secondary"}
            size="lg"
            className="w-14 h-14 rounded-full"
          >
            {isSpeakerOn ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Call Status */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Connected</span>
          </div>

          {/* Connection Status */}
          {connectionStatus && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Connection: {connectionStatus.connectionState}</div>
              <div>ICE: {connectionStatus.iceConnectionState}</div>
              <div>Signaling: {connectionStatus.signalingState}</div>
              <div>
                Local Stream: {connectionStatus.hasLocalStream ? "Yes" : "No"}
              </div>
              <div>
                Remote Stream: {connectionStatus.hasRemoteStream ? "Yes" : "No"}
              </div>
            </div>
          )}

          {/* Reconnect Button */}
          <Button
            onClick={handleReconnect}
            disabled={isReconnecting}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            {isReconnecting ? "Reconnecting..." : "Reconnect"}
          </Button>

          {/* Manual SDP Exchange Button */}
          <Button
            onClick={async () => {
              if (audioCallService) {
                await audioCallService.triggerSdpExchange();
              }
            }}
            variant="outline"
            size="sm"
            className="mt-2 ml-2"
          >
            Trigger SDP Exchange
          </Button>

          {/* Debug Button */}
          <Button
            onClick={() => {
              if (audioCallService) {
                audioCallService.debugWebSocketStatus();
              }
            }}
            variant="outline"
            size="sm"
            className="mt-2 ml-2"
          >
            Debug WebSocket
          </Button>
        </div>

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Ending call...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
