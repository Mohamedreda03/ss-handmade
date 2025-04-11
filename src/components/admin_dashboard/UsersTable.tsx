"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Years } from "@/utils/years_data";

import { User } from "@prisma/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "react-query";
import Link from "next/link";
import Loading from "../Loading";
import Pagenation from "../Pagenation";
import { Badge } from "../ui/badge";

const filterUsers = ["online", "center"];
const filterGrades = ["1", "2", "3"];

export default function UsersTable() {
  const pageSize = 15;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchName, setSearchName] = useState<string>("");
  const [searchBtn, setSearchBtn] = useState<string>("1");

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["users", currentPage, searchBtn],
    queryFn: async () => {
      const res = await axios.get(
        `/api/users/search?name=${searchName}&page=${currentPage}&pageSize=${pageSize}`
      );

      setCurrentPage(res.data.meta.currentPage);
      setSearchTotalPages(res.data.meta.totalPages);

      return res.data;
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchBtn(Math.random().toString());
  };

  return (
    <div>
      <div>
        <form
          onSubmit={handleSearch}
          className="mb-4 flex items-center flex-col sm:flex-row gap-3"
        >
          <Input
            placeholder="بحث بأسم المستخدم"
            className="max-w-[300px]"
            onChange={(e) => setSearchName(e.target.value)}
            disabled={dataLoading}
          />

          <div>
            <Button disabled={dataLoading} className="mt-auto">
              <span>بحث</span>
              <Search size={15} className="mr-1.5" />
            </Button>
          </div>
        </form>
      </div>

      {dataLoading ? (
        <Loading className="h-[300px]" />
      ) : (
        <Table dir="rtl" className="mb-8 border">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">أسم المستخدم</TableHead>
              <TableHead className="text-center">البريد الالكتروني</TableHead>
              <TableHead className="text-center">الصلاحيه</TableHead>

              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          {data?.data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-lg">
                لا يوجد بيانات
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {data &&
              data?.data.map((user: User) => (
                <TableRow key={user?.id}>
                  <TableCell className="font-medium text-center">
                    {user?.name}
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    {user?.email || "لا يوجد"}
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    <Badge
                      variant={
                        user?.role === "STUDENT"
                          ? "secondary"
                          : user?.role === "ADMIN"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {user?.role === "STUDENT"
                        ? "USER"
                        : user?.role === "ADMIN"
                        ? "ADMIN"
                        : "CONSTRUCTOR"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button asChild>
                      <Link href={`/admin/users/${user?.id}`}>التفاصيل</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

      {searchTotalPages > 1 && (
        <Pagenation
          currentPage={currentPage}
          searchTotalPages={searchTotalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}
