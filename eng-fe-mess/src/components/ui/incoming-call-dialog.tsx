"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import audioCallService, {
  AudioCallResponse,
} from "@/service/audio-call.service";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useEffect, useState } from "react";

interface IncomingCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  call: AudioCallResponse | null;
  onCallAccepted: (call: AudioCallResponse) => void;
  onCallRejected: (call: AudioCallResponse) => void;
}

export function IncomingCallDialog({
  isOpen,
  onClose,
  call,
  onCallAccepted,
  onCallRejected,
}: IncomingCallDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isOpen && call) {
      // Play ringtone or notification sound
      // You can implement this based on your needs
      console.log("Incoming call from:", call.callerId);
    }
  }, [isOpen, call]);

  const handleAcceptCall = async () => {
    if (!call || !audioCallService) return;

    setIsLoading(true);
    try {
      // Accept the call
      const acceptedCall = await audioCallService.acceptCall(call.callId);
      onCallAccepted(acceptedCall);
      onClose();
    } catch (error) {
      console.error("Error accepting call:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectCall = async () => {
    if (!call || !audioCallService) return;

    setIsLoading(true);
    try {
      // Reject the call
      await audioCallService.rejectCall(call.callId);
      onCallRejected(call);
      onClose();
    } catch (error) {
      console.error("Error rejecting call:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implement mute logic if needed
  };

  if (!call) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Incoming Call</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 p-6">
          {/* Caller Avatar/Info */}
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Incoming Call</h3>
            <p className="text-sm text-muted-foreground">
              Call ID: {call.callId}
            </p>
            <p className="text-sm text-muted-foreground">
              Type: {call.callType}
            </p>
          </div>

          {/* Call Controls */}
          <div className="flex space-x-4">
            {/* Accept Call Button */}
            <Button
              onClick={handleAcceptCall}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700"
            >
              <Phone className="w-8 h-8" />
            </Button>

            {/* Reject Call Button */}
            <Button
              onClick={handleRejectCall}
              disabled={isLoading}
              variant="destructive"
              className="w-16 h-16 rounded-full"
            >
              <PhoneOff className="w-8 h-8" />
            </Button>
          </div>

          {/* Mute Button */}
          <Button
            onClick={toggleMute}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            {isMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </Button>

          {isLoading && (
            <div className="text-sm text-muted-foreground">Processing...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
