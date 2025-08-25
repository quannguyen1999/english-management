"use client";

import { FeaturedCourseCard } from "./sections/featured-course-card";
import { CourseListingSection } from "./sections/course-listing-section";

export function LearningMainContent() {
  return (
    <main className="flex-1 overflow-y-auto p-6 no-scrollbar">
      <div className="grid grid-cols-12 gap-6">
        {/* Center Column - Featured Course */}
        <div className="col-span-7">
          <FeaturedCourseCard />
        </div>

        {/* Right Column - Course Listing */}
        <div className="col-span-5 space-y-6">
          <CourseListingSection />
        </div>
      </div>
    </main>
  );
} 