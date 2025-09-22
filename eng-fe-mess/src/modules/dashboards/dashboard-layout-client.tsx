"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import FriendHeaderView from "./friend-header-view";
import { FriendSearchFilter } from "./friend-search-filter";
import { FriendSearchView } from "./friend-search-view";
import { LearningSidebarContent } from "./learning-sidebar-content";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  dict: any;
}

export function DashboardLayoutClient({
  children,
  dict,
}: DashboardLayoutClientProps) {
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showFriendsSidebar, setShowFriendsSidebar] = useState(true);

  const toggleLeftSidebar = () => {
    setShowLeftSidebar(!showLeftSidebar);
  };

  const toggleFriendsSidebar = () => {
    setShowFriendsSidebar(!showFriendsSidebar);
  };

  return (
    <div className="flex h-screen">
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden border-r-2 border-gray-200 ${
          showFriendsSidebar
            ? "w-64 opacity-100 translate-x-0"
            : "w-0 opacity-0 translate-x-full"
        }`}
      >
        <div className="h-full">
          <FriendSearchFilter />
          <FriendSearchView />
        </div>
      </div>

      <div className="flex items-center">
        <Button
          onClick={toggleFriendsSidebar}
          variant="ghost"
          size="icon"
          className="w-0 bg-gray-100 h-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 cursor-pointer"
          title={showFriendsSidebar ? "Hide Friends" : "Show Friends"}
        >
          <div className="transition-all duration-300 ease-in-out transform bg-gray-200 absolute h-8 w-8 rounded-full flex items-center justify-center">
            {showFriendsSidebar ? (
              <ChevronLeft className="h-4 w-4 transition-transform duration-300 ease-in-out transform rotate-0" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform duration-300 ease-in-out transform scale-110" />
            )}
          </div>
        </Button>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      <div className="flex items-center">
        <Button
          onClick={toggleLeftSidebar}
          variant="ghost"
          size="icon"
          className="w-0.5 bg-gray-100 h-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 cursor-pointer"
          title={
            showLeftSidebar
              ? "Hide Personal Learning"
              : "Show Personal Learning"
          }
        >
          <div className="transition-all duration-300 ease-in-out transform bg-gray-200 absolute z-10 h-8 w-8 rounded-full flex items-center justify-center">
            {showLeftSidebar ? (
              <ChevronLeft className="h-4 w-4 transition-transform duration-300 ease-in-out transform rotate-0" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform duration-300 ease-in-out transform scale-110" />
            )}
          </div>
        </Button>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden border-r-2 border-gray-200 ${
          showLeftSidebar
            ? "w-64 opacity-100 translate-x-0"
            : "w-0 opacity-0 translate-x-full"
        }`}
      >
        <div className="h-full">
          <div>
            <FriendHeaderView dict={dict} />
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <LearningSidebarContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
