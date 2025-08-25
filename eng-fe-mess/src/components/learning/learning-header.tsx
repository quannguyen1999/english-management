"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LearningHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        

        {/* Search Bar - Centered */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Input
              placeholder="Search for a course"
              className="pl-4 pr-20 py-2 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button className="absolute right-1 top-1 h-7 px-3 text-sm">
              GO
            </Button>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          
          
          {/* User Icon */}
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <User className="w-4 h-4" />
          </Button>
          
          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="w-8 h-8 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
} 