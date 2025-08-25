"use client";

import { ConversationProvider } from "@/components/providers/conversation-provider";
import { ActiveCall } from "@/components/ui/active-call";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { IncomingCallDialog } from "@/components/ui/incoming-call-dialog";
import { useWebSocket } from "@/hooks/use-websocket";
import ConversationContentView from "@/modules/chats/conversation-content-view";
import ConversationInputView from "@/modules/chats/conversation-input-view";
import { getConversationParticipants } from "@/service/api-conversation";
import audioCallService from "@/service/audio-call.service";
import { AudioCallNotification, AudioCallResponse } from "@/types/message";
import { getCurrentUserId } from "@/utils/auth";
import { MicIcon, Video } from "lucide-react";
import { useEffect, useState } from "react";

export default function MeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; lang: string }>;
  searchParams: Promise<{ username?: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{
    id: string;
    lang: string;
  } | null>(null);
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{
    username?: string;
  } | null>(null);
  const [isIncomingCallOpen, setIsIncomingCallOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState<AudioCallResponse | null>(
    null
  );
  const [activeCall, setActiveCall] = useState<AudioCallResponse | null>(null);
  const [isCallInitiating, setIsCallInitiating] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);

  const { subscribeToUserStatus, onAudioCall } = useWebSocket();

  useEffect(() => {
    const initParams = async () => {
      const paramsData = await params;
      const searchData = await searchParams;
      setResolvedParams(paramsData);
      setResolvedSearchParams(searchData);
    };
    initParams();
  }, [params, searchParams]);

  useEffect(() => {
    if (resolvedParams?.id) {
      // Subscribe to user status updates
      subscribeToUserStatus(resolvedParams.id);

      // Fetch conversation participants to get the target user ID
      fetchConversationParticipants(resolvedParams.id);
    }
  }, [resolvedParams, subscribeToUserStatus]);

  const fetchConversationParticipants = async (conversationId: string) => {
    try {
      const response = await getConversationParticipants(conversationId);
      if (response.status === 200 && response.data.length > 0) {
        // Get the first participant (should be the other user in a private conversation)
        const participant = response.data[0];
        setTargetUserId(participant.userId);
      }
    } catch (error) {
      console.error("Error fetching conversation participants:", error);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  useEffect(() => {
    // Listen for audio call notifications
    const unsubscribe = onAudioCall((notification: AudioCallNotification) => {
      switch (notification.type) {
        case "INCOMING_CALL":
          setIncomingCall(notification.data);
          setIsIncomingCallOpen(true);
          break;
        case "CALL_ACCEPTED":
          setActiveCall(notification.data);
          setIsIncomingCallOpen(false);
          setIncomingCall(null);
          break;
        case "CALL_REJECTED":
          setIsIncomingCallOpen(false);
          setIncomingCall(null);
          // Handle call rejection (show toast, etc.)
          break;
        case "CALL_ENDED":
          setActiveCall(null);
          break;
      }
    });

    return unsubscribe;
  }, [onAudioCall]);

  // Set up audio call service with current user ID
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (currentUserId && audioCallService) {
      audioCallService.setCurrentUserId(currentUserId);

      // Set up call event handlers
      audioCallService.onIncomingCall = (callData) => {
        setIncomingCall(callData);
        setIsIncomingCallOpen(true);
      };

      audioCallService.onCallAccepted = (callData) => {
        setActiveCall(callData);
        setIsIncomingCallOpen(false);
        setIncomingCall(null);
      };

      audioCallService.onCallRejected = (callData) => {
        setIsIncomingCallOpen(false);
        setIncomingCall(null);
      };

      audioCallService.onCallEnded = (callData) => {
        setActiveCall(null);
      };
    }
  }, []);

  const handleInitiateCall = async () => {
    if (
      !resolvedParams?.id ||
      !resolvedSearchParams?.username ||
      !targetUserId
    ) {
      console.error("Missing required data for call initiation");
      return;
    }

    setIsCallInitiating(true);
    try {
      const callRequest = {
        conversationId: resolvedParams.id,
        targetUserId: targetUserId, // Using the actual target user ID from conversation
        callType: "AUDIO" as const,
      };

      console.log("Initiating call with request:", callRequest);

      if (!audioCallService) {
        throw new Error("Audio call service not available");
      }

      const callResponse = await audioCallService.initiateCall(callRequest);
      setActiveCall(callResponse);
    } catch (error) {
      console.error("Error initiating call:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsCallInitiating(false);
    }
  };

  const handleCallAccepted = (call: AudioCallResponse) => {
    setActiveCall(call);
    setIsIncomingCallOpen(false);
    setIncomingCall(null);
  };

  const handleCallRejected = (call: AudioCallResponse) => {
    setIsIncomingCallOpen(false);
    setIncomingCall(null);
    // Handle call rejection (show toast, etc.)
  };

  const handleCallEnded = () => {
    setActiveCall(null);
  };

  if (!resolvedParams || !resolvedSearchParams) {
    return <div>Loading...</div>;
  }

  const { id } = resolvedParams;
  const username = resolvedSearchParams.username ?? "Unknown";

  // If there's an active call, show the call interface
  if (activeCall) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center p-4">
        <ActiveCall call={activeCall} onCallEnded={handleCallEnded} />
      </div>
    );
  }

  return (
    <ConversationProvider id={id}>
      <div className="flex flex-col w-full h-full">
        <div className="w-full h-16 border-b-2 flex flex-row items-center px-2 gap-x-2">
          <GeneratedAvatar
            variant="botttsNeutral"
            seed={username}
            classname="size-10"
          />
          <div className="flex flex-col w-full">
            <h1>{username}</h1>
            <p>{isLoadingParticipants ? "Loading..." : "12:00"}</p>
          </div>
          <div className="flex flex-row gap-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleInitiateCall}
              disabled={
                isCallInitiating || !targetUserId || isLoadingParticipants
              }
              title={
                isLoadingParticipants
                  ? "Loading conversation participants..."
                  : !targetUserId
                  ? "Unable to determine target user"
                  : isCallInitiating
                  ? "Call in progress..."
                  : "Start video call"
              }
            >
              <Video className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleInitiateCall}
              disabled={
                isCallInitiating || !targetUserId || isLoadingParticipants
              }
              title={
                isLoadingParticipants
                  ? "Loading conversation participants..."
                  : !targetUserId
                  ? "Unable to determine target user"
                  : isCallInitiating
                  ? "Call in progress..."
                  : "Start audio call"
              }
            >
              <MicIcon className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden px-4">
          {" "}
          <ConversationContentView />
        </div>
        <ConversationInputView />

        {/* Incoming Call Dialog */}
        <IncomingCallDialog
          isOpen={isIncomingCallOpen}
          onClose={() => setIsIncomingCallOpen(false)}
          call={incomingCall}
          onCallAccepted={handleCallAccepted}
          onCallRejected={handleCallRejected}
        />
      </div>
    </ConversationProvider>
  );
}
