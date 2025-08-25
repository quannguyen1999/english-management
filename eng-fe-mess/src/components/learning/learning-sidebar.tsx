"use client";

import { 
  Compass, 
  Grid3X3, 
  Settings, 
  Calendar, 
  Zap, 
  Rocket 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function LearningSidebar() {
  const navigationItems = [
    { icon: Compass, label: "Explore", href: "#" },
    { icon: Grid3X3, label: "Dashboard", href: "#" },
    { icon: Settings, label: "My Settings", href: "#" },
    { icon: Calendar, label: "Course Calendar", href: "#" },
  ];

  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
      {/* User Greeting */}
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src="/api/avatar/user" />
          <AvatarFallback className="bg-gray-300 text-gray-600">
            SK
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-gray-900">Hi Shakir</h2>
          <p className="text-sm text-gray-500">Welcome back!</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <Card className="border-gray-200">
        <CardContent className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Figma Plus Promotion */}
      <Card className="border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Figma Plus</p>
              <p className="text-xs text-gray-500">by Figma Love</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade to Pro */}
      <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-4 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Upgrade to Pro</h3>
          <p className="text-sm text-gray-600 mb-3">
            Get 1 month free on annual subscription
          </p>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Upgrade Today!
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
} 