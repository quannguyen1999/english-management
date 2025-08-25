"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/service/utils";

interface ProgressCardProps {
  title: string;
  progress: number;
  progressLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  gradient?: string;
}

export function ProgressCard({ 
  title, 
  progress, 
  progressLabel = "Progress",
  actionLabel,
  onAction,
  className,
  gradient = "from-purple-50 to-blue-50"
}: ProgressCardProps) {
  return (
    <Card className={cn("border-gray-200 bg-gradient-to-r", gradient, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">
            {title}
          </CardTitle>
          {actionLabel && onAction && (
            <Button 
              variant="link" 
              className="text-purple-600 p-0 h-auto"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{progressLabel}</span>
            <span className="font-medium text-gray-900">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
} 