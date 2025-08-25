"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Users, BookOpen } from "lucide-react";
import FriendHeaderView from "./friend-header-view";
import { LearningSidebarContent } from "./learning-sidebar-content";
import { FriendSearchFilter } from "./friend-search-filter";
import { FriendSearchView } from "./friend-search-view";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  dict: any;
}

export function DashboardLayoutClient({ children, dict }: DashboardLayoutClientProps) {
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
      {/* Left Sidebar - Personal Learning (Conditional with animations) */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showLeftSidebar 
            ? 'w-64 opacity-100 translate-x-0' 
            : 'w-0 opacity-0 -translate-x-full'
        }`}
      >
        <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
          {/* Header */}
          <FriendHeaderView dict={dict} />
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <LearningSidebarContent />
          </div>
        </div>
      </div>

      {/* Left Toggle Button */}
      <div className="flex items-center">
        <Button
          onClick={toggleLeftSidebar}
          variant="ghost"
          size="icon"
          className="h-12 w-6 bg-white border-r border-gray-200 hover:bg-gray-50 rounded-r-none transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          title={showLeftSidebar ? "Hide Personal Learning" : "Show Personal Learning"}
        >
          <div className="transition-all duration-300 ease-in-out transform">
            {showLeftSidebar ? (
              <ChevronLeft className="h-4 w-4 transition-transform duration-300 ease-in-out transform rotate-0" />
            ) : (
              <BookOpen className="h-4 w-4 transition-transform duration-300 ease-in-out transform scale-110" />
            )}
          </div>
        </Button>
      </div>
        
      {/* Center Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
        
      {/* Right Toggle Button - Always visible with animations */}
      <div className="flex items-center">
        <Button
          onClick={toggleFriendsSidebar}
          variant="ghost"
          size="icon"
          className="h-12 w-6 bg-white border-l border-gray-200 hover:bg-gray-50 rounded-l-none transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          title={showFriendsSidebar ? "Hide Friends" : "Show Friends"}
        >
          <div className="transition-all duration-300 ease-in-out transform">
            {showFriendsSidebar ? (
              <ChevronRight className="h-4 w-4 transition-transform duration-300 ease-in-out transform rotate-0" />
            ) : (
              <Users className="h-4 w-4 transition-transform duration-300 ease-in-out transform scale-110" />
            )}
          </div>
        </Button>
      </div>
        
      {/* Right Sidebar - Friends (Conditional with animations) */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showFriendsSidebar 
            ? 'w-64 opacity-100 translate-x-0' 
            : 'w-0 opacity-0 translate-x-full'
        }`}
      >
        <div className="w-64 bg-white border-l border-gray-200 p-6 no-scrollbar overflow-y-auto">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Friends</h3>
            <FriendSearchFilter />
            <FriendSearchView />
          </div>
        </div>
      </div>
    </div>
  );
} 