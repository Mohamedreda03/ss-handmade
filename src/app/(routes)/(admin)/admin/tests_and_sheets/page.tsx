"use client";

import { Button } from "@/components/ui/button";
import { Course } from "@prisma/client";
import { useEffect, useState, useCallback } from "react";
import { Years_Banks } from "@/utils/years_data";
import { useQuery } from "react-query";
import Loading from "@/components/Loading";
import axios from "axios";
import CourseLinkData from "@/components/tests_and_sheets_dashboard/CourseLinkData";

type YearsType = "1" | "2" | "3" | "B1" | "B2" | "B3" | null;

export default function TestsAndSheets() {
  const [currentYear, setCurrentYear] = useState<YearsType>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const data = await axios.get("/api/courses").then((res) => res.data.data);
      setFilteredCourses(data as Course[]);
      return data;
    },
  });

  const filterCourses = useCallback(
    (year: YearsType) => {
      if (year === null) {
        setFilteredCourses(data as Course[]);
        setCurrentYear(year);
        return;
      }
      setCurrentYear(year);
      setFilteredCourses(
        data && data?.filter((course: any) => course?.year === year)!
      );
    },
    [data]
  );

  useEffect(() => {
    filterCourses(null);
  }, [data, filterCourses]);

  if (isLoading) {
    return <Loading className="h-[300px]" />;
  }

  return (
    <div className="px-5 pb-10 pt-7 md:px-10">
      <div className="flex items-center justify-center mb-8">
        <h2 className="text-3xl border-b-2 border-first pb-1">
          بيانات الامتحانات والواجبات
        </h2>
      </div>
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center justify-center flex-wrap gap-3 border p-2 rounded-lg border-secondary/50">
          <Button
            variant={currentYear === null ? "secondary" : "outline"}
            onClick={() => filterCourses(null)}
          >
            الكل
          </Button>
          {Years_Banks.map((year) => (
            <Button
              key={year.year}
              variant={currentYear === year.year ? "secondary" : "outline"}
              onClick={() => filterCourses(year.year as YearsType)}
            >
              {year.name}
            </Button>
          ))}
        </div>
      </div>
      {filteredCourses.length === 0 ? (
        <div className="flex items-center justify-center h-52">
          <p className="text-2xl">لا يوجد دورات</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredCourses &&
            filteredCourses?.map((course) => (
              <CourseLinkData key={course.id} course={course} />
            ))}
        </div>
      )}
    </div>
  );
}
