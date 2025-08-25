"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function FeaturedCourseCard() {
  return (
    <Card className="border-gray-200 bg-white h-full">
      <CardHeader className="pb-4">
        {/* Geometric Design Header */}
        <div className="w-full h-24 bg-gradient-to-r from-orange-400 via-blue-500 to-purple-600 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-2">
              {/* Horizontal stripes */}
              <div className="w-2 h-8 bg-white/20 rounded"></div>
              <div className="w-2 h-8 bg-white/20 rounded"></div>
              <div className="w-2 h-8 bg-white/20 rounded"></div>
            </div>
            {/* Diamond */}
            <div className="w-6 h-6 bg-white/30 transform rotate-45 mx-4"></div>
            {/* Cross */}
            <div className="w-6 h-6 bg-white/30 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-white/50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-4 bg-white/50"></div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Course Title and Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Illustrator Tips & Tricks
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Learn how to create beautiful scenes in illustrator. Tips and Tricks with real life projects and case studies.
          </p>
        </div>

        {/* Enrollment Information */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            121 people enrolled so far!
          </p>
          <div className="flex items-center space-x-2">
            {/* Student Avatars */}
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Avatar key={i} className="w-6 h-6 border-2 border-white">
                  <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                    S{i}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-gray-500">+115</span>
          </div>
        </div>

        {/* Enroll Button */}
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Enroll Today!
        </Button>
      </CardContent>
    </Card>
  );
} 