"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import Loading from "@/components/Loading";
import { useState } from "react";
import { useQuery } from "react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function CoursesDataTable() {
  const pageSize = 8;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["courses", currentPage],
    queryFn: async () => {
      const data = await axios
        .get(`/api/dashboard/courses?page=${currentPage}&limit=${pageSize}`)
        .then((res) => res.data);
      setCurrentPage(data?.currentPage!);
      setTotalPages(data?.totalPages!);

      return data?.courses;
    },
  });

  if (dataLoading) {
    return <Loading className="h-[300px]" />;
  }

  return (
    <div>
      <Table dir="rtl" className="mb-8 border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">أسم الكورس</TableHead>
            <TableHead className="text-center">سعر الكورس</TableHead>
            <TableHead className="text-center">عدد الاشتراكات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-lg">
                لا يوجد بيانات
              </TableCell>
            </TableRow>
          )}
          {data?.map((course: any) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium text-center">
                {course.title}
              </TableCell>
              <TableCell className="text-center">{course.price}</TableCell>

              <TableCell className="text-center">
                {course._count.Subscription}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-3 mb-4">
          <div className="flex items-center gap-3">
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ArrowRight size={15} className="ml-1.5" />
              <span>التالي</span>
            </Button>
            <div className="flex items-center flex-row-reverse gap-2 text-lg">
              {Array.from({ length: totalPages }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "cursor-pointer border px-2 rounded-md",
                    i + 1 === currentPage ? "border-secondary/75" : ""
                  )}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <span>السابق</span>
              <ArrowLeft size={15} className="mr-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
