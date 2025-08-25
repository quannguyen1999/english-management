"use client";

import { LearningHeader } from "@/components/learning/learning-header";
import { LearningMainContent } from "@/components/learning/learning-main-content";

export function DashboardClientWrapper() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <LearningHeader />
      
      {/* Main Content Area */}
      <LearningMainContent />
    </div>
  );
} 