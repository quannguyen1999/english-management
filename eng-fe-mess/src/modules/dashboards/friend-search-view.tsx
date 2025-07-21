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
        message: "Hello, how are you?",
        startedAt: new Date(),
      },
      {
        id: 3,
        name: "Travel English",
        agent: { name: "Charlie" },
        message: "Hello, how are you?",
        startedAt: new Date(),
      },
    ],
    totalPages: 1,
  };

  return (
    <div className="flex-1">
      <DataTable
        columns={columns}
        data={data?.items ?? []}
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
