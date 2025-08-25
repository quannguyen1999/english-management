"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Smartphone } from "lucide-react";
import { StatsCard } from "../components/stats-card";
import { CourseCard } from "../components/course-card";

export function CourseListingSection() {
  const courses = [
    {
      id: 1,
      title: "Master Figma",
      description: "Learn Figma in 30 days.",
      duration: "42 Hours",
      price: "$199.00",
      icon: Monitor,
      color: "from-green-400 to-green-500"
    },
    {
      id: 2,
      title: "UI With Mikey",
      description: "Learn Figma in 30 days.",
      duration: "42 Hours",
      price: "$199.00",
      icon: Smartphone,
      color: "from-green-400 to-green-500"
    }
  ];

  const summaryCards = [
    { number: "19", label: "New Courses", color: "from-pink-400 to-pink-500" },
    { number: "14", label: "New Tutors", color: "from-blue-400 to-blue-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs and Filters */}
      <div className="space-y-4">
        <Tabs defaultValue="new-courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-courses">New Courses</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex space-x-3">
          <Select>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Cards */}
      <div className="space-y-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            description={course.description}
            duration={course.duration}
            price={course.price}
            icon={course.icon}
            color={course.color}
            onEnroll={() => console.log(`Enrolling in ${course.title}`)}
          />
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {summaryCards.map((card) => (
          <StatsCard
            key={card.label}
            number={card.number}
            label={card.label}
            color={card.color}
          />
        ))}
      </div>
    </div>
  );
} 