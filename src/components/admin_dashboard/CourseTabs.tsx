"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Settings, FileText, Users, BarChart3, BookOpen } from "lucide-react";

interface CourseTabsProps {
  courseId: string;
}

export default function CourseTabs({ courseId }: CourseTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "الإعدادات العامة",
      href: `/admin/courses/${courseId}`,
      icon: Settings,
      current: pathname === `/admin/courses/${courseId}`,
    },
    {
      name: "إدارة المهام",
      href: `/admin/courses/${courseId}/assignments`,
      icon: FileText,
      current: pathname.startsWith(`/admin/courses/${courseId}/assignments`),
    },
    {
      name: "الطلاب المشتركين",
      href: `/admin/courses/${courseId}/sub`,
      icon: Users,
      current: pathname === `/admin/courses/${courseId}/sub`,
    },
    {
      name: "التقارير",
      href: `/admin/courses/${courseId}/analytics`,
      icon: BarChart3,
      current: pathname === `/admin/courses/${courseId}/analytics`,
    },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8 space-x-reverse">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm",
                tab.current
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon
                className={cn(
                  "ml-2 h-5 w-5",
                  tab.current
                    ? "text-primary"
                    : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
