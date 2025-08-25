"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/service/utils";

interface StatsCardProps {
  number: string | number;
  label: string;
  color?: string;
  className?: string;
}

export function StatsCard({ number, label, color = "from-blue-400 to-blue-500", className }: StatsCardProps) {
  return (
    <Card className={cn("border-gray-200 bg-gradient-to-r", color, className)}>
      <CardContent className="p-4 text-center">
        <div className="text-2xl font-bold text-white mb-1">
          {number}
        </div>
        <div className="text-sm text-white/90">
          {label}
        </div>
      </CardContent>
    </Card>
  );
} 