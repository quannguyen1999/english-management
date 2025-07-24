"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FriendSearchFilter } from "./friend-search-filter";
import { FriendSearchView } from "./friend-search-view";

export const FriendsListHeader = () => {
  return (
    <div className="h-full">
      <ScrollArea>
        <div className="h-full items-center gap-x-2 p-1">
          <FriendSearchFilter />
          <FriendSearchView />
          <ScrollBar orientation="horizontal" />
        </div>
      </ScrollArea>
    </div>
  );
};
