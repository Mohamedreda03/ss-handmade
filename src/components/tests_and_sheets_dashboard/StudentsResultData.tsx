"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  FileUserData,
  Lesson,
  TestUserData,
  VideoUserData,
} from "@prisma/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Search, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import axios from "axios";
import Loading from "../Loading";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import Pagenation from "../Pagenation";

interface UserTestsAndSheetsTableProps {
  lessonId: string;
  courseId: string;
}

export default function StudentsResultData({
  lessonId,
  courseId,
}: UserTestsAndSheetsTableProps) {
  const pageSize = 15;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState<string>("");
  const [searchPhone, setSearchPhone] = useState<string>("");
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchBtn, setSearchBtn] = useState<string>("1");
  const [filter, setFilter] = useState<"desc" | "asc">("desc");

  const { data, isLoading } = useQuery({
    queryKey: ["studentsResults", lessonId, filter, currentPage, searchBtn],
    queryFn: async () => {
      const res = await axios.get(
        `/api/admin_tests_and_sheets/${courseId}/${lessonId}/get_all_user_results?name=${searchName}&phone=${searchPhone}&page=${currentPage}&pageSize=${pageSize}&order=${filter}`
      );

      setCurrentPage(res.data.meta.currentPage);
      setSearchTotalPages(res.data.meta.totalPages);

      return res.data.data;
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchBtn(Math.random().toString());
  };

  return (
    <div className="mt-8">
      <div>
        <form
          onSubmit={handleSearch}
          className="mb-4 flex items-center flex-col sm:flex-row gap-3"
        >
          <Input
            placeholder="بحث بأسم المستخدم"
            className="max-w-[300px]"
            onChange={(e) => setSearchName(e.target.value)}
            disabled={isLoading}
          />

          <Input
            placeholder="بحث برقم الهاتف"
            className="max-w-[300px]"
            onChange={(e) => setSearchPhone(e.target.value)}
            disabled={isLoading}
          />

          <div>
            <Button disabled={isLoading} className="mt-auto">
              <span>بحث</span>
              <Search size={15} className="mr-1.5" />
            </Button>
          </div>
        </form>
      </div>
      <div className="flex">
        <div className="flex flex-wrap gap-3 items-center border border-second rounded-lg p-2">
          <Button
            variant={filter === "desc" ? "secondary" : "outline"}
            onClick={() => setFilter("desc")}
          >
            من الاعلى الى الاقل
          </Button>
          <Button
            variant={filter === "asc" ? "secondary" : "outline"}
            onClick={() => setFilter("asc")}
          >
            من الاقل الى الاعلى
          </Button>
        </div>
      </div>
      <Table dir="rtl" className="mb-8 border mt-4">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">اسم المستخدم</TableHead>
            <TableHead className="text-center">رقم هاتف المستخدم</TableHead>
            <TableHead className="text-center">رقم هاتف ولي الامر</TableHead>
            <TableHead className="text-center">درجة المستخدم</TableHead>
            <TableHead className="text-center">اجابات المستخدم</TableHead>
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-lg">
                <Loading />
              </TableCell>
            </TableRow>
          ) : (
            <>
              {data?.map((test: any) => (
                <TableRow key={test?.id}>
                  <TableCell className="font-medium text-center">
                    {test?.user?.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {test?.user?.student_phone}
                  </TableCell>
                  <TableCell className="text-center">
                    {test?.user?.parent_phone}
                  </TableCell>
                  <TableCell className="text-center">
                    {test?.testResult}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button>
                      <Link
                        href={`/admin/tests_and_sheets/${courseId}/${lessonId}/${test.id}?lessonId=${lessonId}`}
                      >
                        عرض الاجابات
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>

      {/* pagination */}
      {searchTotalPages > 1 && (
        <Pagenation
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchTotalPages={searchTotalPages}
        />
      )}
    </div>
  );
}
