import { ConversationProvider } from "@/components/providers/conversation-provider";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import ConversationContentView from "@/modules/chats/conversation-content-view";
import ConversationInputView from "@/modules/chats/conversation-input-view";
import { MicIcon, Video } from "lucide-react";

export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; lang: string }>;
  searchParams: Promise<{ username?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { id } = resolvedParams;
  const username = resolvedSearchParams.username ?? "Unknown";

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
            <Video className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            <MicIcon className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
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
