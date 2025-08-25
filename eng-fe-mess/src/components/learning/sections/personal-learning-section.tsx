"use client";

import { Target, Calendar, Settings, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressCard } from "../components/progress-card";

export function PersonalLearningSection() {
  const actionableItems = [
    { icon: Target, label: "Goals", href: "#" },
    { icon: Calendar, label: "Monthly Plan", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <div className="space-y-6">
      {/* Goals Status Card */}
      <ProgressCard
        title="Goals Status"
        progress={80}
        progressLabel="Goals"
        actionLabel="Manage Goals"
        onAction={() => console.log("Managing goals...")}
        gradient="from-purple-50 to-blue-50"
      />

      {/* Actionable Items Card */}
      <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4 space-y-3">
          {actionableItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-between text-gray-700 hover:bg-white/50 p-3 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 