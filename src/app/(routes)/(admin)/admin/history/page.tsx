"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { useQuery } from "react-query";
import Loading from "@/components/Loading";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Pagenation from "@/components/Pagenation";

export default function HistoryPage() {
  const pageSize = 15;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchName, setSearchName] = useState<string>("");
  const [searchBtn, setSearchBtn] = useState<string>("1");

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["userHistory", currentPage, searchBtn],
    queryFn: async () => {
      const res = await axios.get(
        `/api/history?page=${currentPage}&pageSize=${pageSize}&name=${searchName}`
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
    <div className="px-5 py-10 md:px-10">
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
              <TableHead className="text-center">ايمال المستخدم</TableHead>
              <TableHead className="text-center">تاريخ العمليه</TableHead>

              <TableHead className="text-center">القيمة</TableHead>
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
              data?.data.map((history: any) => (
                <TableRow key={history?.id}>
                  <TableCell className="font-medium text-center">
                    {history?.user?.name}
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    {history?.user?.email || "لا يوجد"}
                  </TableCell>
                  <TableCell className="text-center">
                    {format(
                      history?.createdAt,
                      "( hh:mm a ) ,eeee, d/ MM/ yyyy",
                      {
                        locale: ar,
                      }
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {history?.price} جنيه
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

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
