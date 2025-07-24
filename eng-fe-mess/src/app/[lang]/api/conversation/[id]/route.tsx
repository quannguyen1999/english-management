// src/app/api/sign-in/route.ts
import { NextRequest, NextResponse } from "next/server";
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
    sender: "Jane Doe",
    receiver: "John Doe",
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(dataFake, { status: 200 });
}
