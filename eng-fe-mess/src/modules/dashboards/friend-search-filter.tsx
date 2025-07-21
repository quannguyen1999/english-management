import { Input } from "@/components/ui/input";
import { useMeetingsFilters } from "@/hooks/use-meetings-filters";
import { SearchIcon } from "lucide-react";

export const FriendSearchFilter = () => {
  const [filter, setFilter] = useMeetingsFilters();
  return (
    <div className="relative">
      <Input
        placeholder="Filter by name"
        className="h-9 bg-white w-full pl-7"
        value={filter.search}
        onChange={(e) => setFilter({ search: e.target.value })}
      />
      <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
};
