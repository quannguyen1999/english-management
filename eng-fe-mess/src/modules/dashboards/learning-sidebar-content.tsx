"use client";

import { PersonalLearningSection } from "@/components/learning/sections/personal-learning-section";

export function LearningSidebarContent() {
  return (
    <div className="overflow-y-auto no-scrollbar">
      <PersonalLearningSection />
    </div>
  );
} 