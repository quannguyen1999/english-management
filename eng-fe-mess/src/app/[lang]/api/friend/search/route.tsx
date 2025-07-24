// src/app/api/sign-in/route.ts
import { NextRequest, NextResponse } from "next/server";

const data = {
  items: [
    {
      id: 1,
      name: "English Conversation 101",
      agent: { name: "Alice" },
      message: "Hello, how are you?",
      startedAt: new Date(),
    },
    {
      id: 2,
      name: "Business English Basics",
      agent: { name: "Bob" },
      message: "Let's talk about meetings.",
      startedAt: new Date(),
    },
    {
      id: 3,
      name: "Travel English",
      agent: { name: "Charlie" },
      message: "Can you ask for directions?",
      startedAt: new Date(),
    },
    {
      id: 4,
      name: "English for Beginners",
      agent: { name: "Diana" },
      message: "Welcome to your first lesson!",
      startedAt: new Date(),
    },
    {
      id: 5,
      name: "Advanced Vocabulary",
      agent: { name: "Ethan" },
      message: "Let’s learn new words today.",
      startedAt: new Date(),
    },
    {
      id: 6,
      name: "Pronunciation Practice",
      agent: { name: "Fiona" },
      message: "Focus on the 'th' sound.",
      startedAt: new Date(),
    },
    {
      id: 7,
      name: "Daily English Practice",
      agent: { name: "George" },
      message: "Let’s start with a quick chat.",
      startedAt: new Date(),
    },
    {
      id: 8,
      name: "English Slang & Idioms",
      agent: { name: "Hannah" },
      message: "Ever heard of 'hit the books'?",
      startedAt: new Date(),
    },
    {
      id: 9,
      name: "TOEFL Prep Course",
      agent: { name: "Ivan" },
      message: "Practice your listening skills.",
      startedAt: new Date(),
    },
    {
      id: 10,
      name: "Grammar Bootcamp",
      agent: { name: "Julia" },
      message: "Let's review past tense rules.",
      startedAt: new Date(),
    },
    {
      id: 11,
      name: "IELTS Speaking Practice",
      agent: { name: "Karen" },
      message: "Describe your hometown.",
      startedAt: new Date(),
    },
    {
      id: 12,
      name: "English for Work",
      agent: { name: "Leo" },
      message: "Let's write a professional email.",
      startedAt: new Date(),
    },
    {
      id: 13,
      name: "Casual Conversations",
      agent: { name: "Mona" },
      message: "What did you do today?",
      startedAt: new Date(),
    },
    {
      id: 14,
      name: "Listening Skills Lab",
      agent: { name: "Nick" },
      message: "Listen and answer the question.",
      startedAt: new Date(),
    },
    {
      id: 15,
      name: "Interview Preparation",
      agent: { name: "Olivia" },
      message: "Tell me about yourself.",
      startedAt: new Date(),
    },
    {
      id: 16,
      name: "Phrasal Verbs Mastery",
      agent: { name: "Peter" },
      message: "Let’s learn 'get over'.",
      startedAt: new Date(),
    },
    {
      id: 17,
      name: "Writing Workshop",
      agent: { name: "Quincy" },
      message: "Let's write a short paragraph.",
      startedAt: new Date(),
    },
    {
      id: 18,
      name: "Reading Comprehension",
      agent: { name: "Rachel" },
      message: "Read the passage and summarize.",
      startedAt: new Date(),
    },
    {
      id: 19,
      name: "Idioms in Context",
      agent: { name: "Steve" },
      message: "Explain 'a blessing in disguise'.",
      startedAt: new Date(),
    },
    {
      id: 20,
      name: "Accent Reduction",
      agent: { name: "Tina" },
      message: "Let’s practice neutral sounds.",
      startedAt: new Date(),
    },
  ],
  totalPages: 2,
};

interface SearchBody {
  search: string;
}

export async function POST(req: NextRequest) {
  const body: SearchBody = await req.json();
  const filteredItems = body.search
    ? data.items.filter((item) =>
        item.agent.name.toLowerCase().includes(body.search.toLowerCase())
      )
    : data.items;

  return NextResponse.json(
    { items: filteredItems, totalPages: 2 },
    { status: 200 }
  );
}
