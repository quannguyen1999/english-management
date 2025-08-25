"use client";

import { Input } from "@/components/ui/input";
import { useMeetingsFilters } from "@/hooks/use-meetings-filters";
import { SearchIcon } from "lucide-react";

export const FriendSearchFilter = () => {
  const [filter, setFilter] = useMeetingsFilters();
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
      <div className="max-w-full">
        <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-2">
          Search Friends
        </label>
        <div className="relative">
          <Input
            id="search"
            placeholder="Search by name or email..."
            className="h-9 bg-white w-full pl-8 pr-3 rounded-md border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 text-sm"
            value={filter.username ?? ""}
            onChange={(e) => setFilter({ username: e.target.value })}
          />
          <SearchIcon className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Type to filter your friends list
        </p>
      </div>
    </div>
  );
};
