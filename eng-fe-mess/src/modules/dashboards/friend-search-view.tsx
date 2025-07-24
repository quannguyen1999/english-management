"use client";
import { columns } from "@/components/ui/columns";
import { DataPagination } from "@/components/ui/data-pagination";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useMeetingsFilters } from "@/hooks/use-meetings-filters";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const FriendSearchView = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const router = useRouter();
  const [data, setData] = useState<any>({
    items: [],
  });
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/friend/search", {
        method: "POST",
        body: JSON.stringify(filters),
      });
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, [filters]);
  return (
    <div className="flex-1">
      <DataTable
        columns={columns}
        data={data?.items.filter((item: any) => {
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
