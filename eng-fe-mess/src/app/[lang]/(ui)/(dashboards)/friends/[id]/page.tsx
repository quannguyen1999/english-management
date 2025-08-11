import { ConversationProvider } from "@/components/providers/conversation-provider";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import ConversationContentView from "@/modules/chats/conversation-content-view";
import ConversationInputView from "@/modules/chats/conversation-input-view";
import { MicIcon, Video } from "lucide-react";

export default function MeetingPage({
  params,
  searchParams,
}: {
  params: { id: string; lang: string };
  searchParams: { username?: string };
}) {
  const { id } = params;
  const username = searchParams.username ?? "Unknown";
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
            <p>12:00</p>
          </div>
          <div className="flex flex-row gap-x-2">
            <Video className="size-6 cursor-pointer" />
            <MicIcon className="size-6 cursor-pointer" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden px-4">
          {" "}
          <ConversationContentView />
        </div>
        <ConversationInputView />
      </div>
    </ConversationProvider>
  );
}
