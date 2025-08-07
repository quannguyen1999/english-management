"use client";
import { friendColumns } from "@/components/ui/columns";
import { DataTable } from "@/components/ui/data-table";
import { useMeetingsFilters } from "@/hooks/use-meetings-filters";
import { getFriendConversations } from "@/service/api-conversation";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

interface FriendData {
  data: any[];
  total: number;
  page: number;
  size: number;
}

export const FriendSearchView = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState<FriendData>({
    data: [],
    total: 0,
    page: 0,
    size: 10,
  });
  
  const observer = useRef<IntersectionObserver>(null);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = data.page + 1;
      const response = await getFriendConversations({
        username: filters.username ?? "",
        page: nextPage,
        size: 10,
      });
      
      const responseData = response.data as FriendData;
      if (responseData.data.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => ({
          ...responseData,
          data: [...prev.data, ...responseData.data]
        }));
      }
    } catch (error) {
      console.error("Error fetching more friend data:", error);
    } finally {
      setLoading(false);
    }
  };

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const response = await getFriendConversations({
          username: filters.username ?? "",
          page: 0,
          size: 10,
        });
        const responseData = response.data as FriendData;
        setData(responseData);
        setHasMore(responseData.data.length === 10);
      } catch (error) {
        console.error("Error fetching friend data:", error);
        setData({
          data: [],
          total: 0,
          page: 0,
          size: 10,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters.username]);

  if (loading && data.data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-500 text-sm font-medium">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          {data?.data && data.data.length > 0 ? (
            <>
              <DataTable
                columns={friendColumns}
                data={data.data}
                onRowClick={(row: any) => router.push(`/friends/${row.userId}`)}
              />
              {hasMore && (
                <div ref={lastElementRef} className="py-4 text-center">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                      <span className="text-sm text-gray-500">Loading more...</span>
                    </div>
                  ) : (
                    <div className="h-4"></div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No friends found</h3>
              <p className="text-xs text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
