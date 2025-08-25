"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/service/utils";

interface CourseCardProps {
  title: string;
  description: string;
  duration: string;
  price: string;
  icon: LucideIcon;
  color?: string;
  className?: string;
  onEnroll?: () => void;
}

export function CourseCard({ 
  title, 
  description, 
  duration, 
  price, 
  icon: Icon, 
  color = "from-green-400 to-green-500",
  className,
  onEnroll
}: CourseCardProps) {
  return (
    <Card className={cn("border-gray-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Course Icon */}
          <div className={cn("w-12 h-12 bg-gradient-to-r rounded-lg flex items-center justify-center flex-shrink-0", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {/* Course Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{duration}</span>
                <span>•</span>
                <span className="font-semibold text-gray-900">{price}</span>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-1">
              {title}
            </h4>
            
            <p className="text-sm text-gray-600 mb-3">
              {description}
            </p>
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onEnroll}
            >
              Enroll Today!
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 