import { columns } from "@/components/ui/columns";
import { DataPagination } from "@/components/ui/data-pagination";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useMeetingsFilters } from "@/hooks/use-meetings-filters";
import { useRouter } from "next/navigation";

export const FriendSearchView = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const router = useRouter();

  // Fake data
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

  return (
    <div className="flex-1">
      <DataTable
        columns={columns}
        data={data?.items.filter((item) => {
          if (filters.search) {
            return item.agent.name
              .toLowerCase()
              .includes(filters.search.toLowerCase());
          }
          return true;
        })}
        onRowClick={(row) => router.push(`/meetings/${row.id}`)}
      />
      <DataPagination
        page={filters.page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={(page) => setFilters({ page })}
      />
      {data?.items.length === 0 && (
        <EmptyState
          title="No meetings found"
          description="You don't have any meetings yet. Create one to get started."
        />
      )}
    </div>
  );
};
