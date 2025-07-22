import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MicIcon, SendIcon, SmileIcon, Video } from "lucide-react";

export default function MeetingPage({ params }: { params: { id: string } }) {
  const currentUser = "John Doe";
  const dataFake = [
    {
      id: "1",
      message: "Hello, how are you?",
      createdAt: "2021-01-01",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "2",
      message: "I'm fine, thank you!",
      createdAt: "2021-01-02",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "3",
      message: "What are you doing?",
      createdAt: "2021-01-03",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "4",
      message: "Just reading a book.",
      createdAt: "2021-01-04",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "5",
      message: "Sounds relaxing!",
      createdAt: "2021-01-05",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "6",
      message: "Yes, it's a great story.",
      createdAt: "2021-01-06",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "7",
      message: "Do you want to go for a walk later?",
      createdAt: "2021-01-07",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "8",
      message: "Sure, what time?",
      createdAt: "2021-01-08",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "9",
      message: "How about 5 PM?",
      createdAt: "2021-01-09",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "10",
      message: "Perfect, see you then!",
      createdAt: "2021-01-10",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "11",
      message: "Where should we meet?",
      createdAt: "2021-01-11",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "12",
      message: "At the park entrance?",
      createdAt: "2021-01-12",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "13",
      message: "Got it. Don’t be late!",
      createdAt: "2021-01-13",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "14",
      message: "Haha, I won't!",
      createdAt: "2021-01-14",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "15",
      message: "By the way, did you finish the project?",
      createdAt: "2021-01-15",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "16",
      message: "Yes, submitted it last night.",
      createdAt: "2021-01-16",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "17",
      message: "Nice! Hope we get good feedback.",
      createdAt: "2021-01-17",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "18",
      message: "Fingers crossed!",
      createdAt: "2021-01-18",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
    {
      id: "19",
      message: "Want to grab coffee after the walk?",
      createdAt: "2021-01-19",
      sender: "John Doe",
      receiver: "Jane Doe",
    },
    {
      id: "20",
      message: "Sounds like a plan!",
      createdAt: "2021-01-20",
      sender: "Jane Doe",
      receiver: "John Doe",
    },
  ];

  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full h-16 border-b-2 flex flex-row items-center px-2 gap-x-2">
        <GeneratedAvatar
          variant="botttsNeutral"
          seed="John Doe"
          classname="size-10 rounded-full"
        />
        <div className="flex flex-col w-full">
          <h1>Bitch</h1>
          <p>12:00</p>
        </div>
        <div className="flex flex-row gap-x-2">
          <Video className="size-6 cursor-pointer" />
          <MicIcon className="size-6 cursor-pointer" />
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-4">
        {" "}
        {/* flex-1 ensures it fills available space */}
        <ScrollArea className="h-full">
          {dataFake.map((item) => (
            <div
              key={item.id}
              className={`flex ${
                item.sender === currentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col max-w-[70%]">
                <p className="text-sm text-gray-500">{item.sender}</p>
                <p className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="w-full border-t-2 flex flex-row gap-x-2">
        <Input
          placeholder="Type a message"
          className="w-full h-[50px] border-none cursor-pointer"
          type="text"
        />

        <div className="flex flex-row gap-x-4 items-center">
          <SmileIcon className="size-6 cursor-pointer" />
          <SendIcon className="size-6 cursor-pointer" />
          <MicIcon className="size-6 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
