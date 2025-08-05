"use client";
import { friendColumns } from "@/components/ui/columns";
import { DataPagination } from "@/components/ui/data-pagination";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useMeetingsFilters } from "@/hooks/use-meetings-filters";
import { getFriendConversations } from "@/service/api-conversation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const FriendSearchView = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const router = useRouter();
  const [data, setData] = useState<any>({
    data: [],
    total: 0,
    page: 0,
    size: 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFriendConversations({
          username: filters.username ?? "",
          page: filters.page ?? 0,
          size: 10,
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching friend data:", error);
        setData({
          data: [],
          total: 0,
          page: 0,
          size: 10,
        });
      }
    };
    fetchData();
  }, [filters]);

  // Calculate total pages
  const totalPages = Math.ceil(data.total / data.size);

  return (
    <div className="flex-1">
      <DataTable
        columns={friendColumns}
        data={data?.data || []}
        onRowClick={(row: any) => router.push(`/friends/${row.userId}`)}
      />
      <DataPagination
        page={data?.page ?? 0}
        totalPages={totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
      {(!data?.data || data.data.length === 0) && (
        <EmptyState
          title="No friends found"
          description="No friends match your search criteria."
        />
      )}
    </div>
  );
};
