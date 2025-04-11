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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Link from "next/link";
import Loading from "@/components/Loading";
import DeleteSubModel from "@/components/admin_dashboard/sub/DeleteSubDataModel";
import toast from "react-hot-toast";
import Pagenation from "@/components/Pagenation";

export default function CourseSub({
  params,
}: {
  params: { courseId: string };
}) {
  const pageSize = 15;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchName, setSearchName] = useState<string>("");
  const [searchPhone, setSearchPhone] = useState<string>("");
  const [searchBtn, setSearchBtn] = useState<string>("1");
  const [deleteSubId, setDeleteSubId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["subUsers", currentPage, searchBtn],
    queryFn: async () => {
      const res = await axios.get(
        `/api/courses/${params.courseId}/sub?name=${searchName}&phone=${searchPhone}&page=${currentPage}&pageSize=${pageSize}`
      );

      setCurrentPage(res.data.meta.currentPage);
      setSearchTotalPages(res.data.meta.totalPages);

      return res.data;
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (id: string) => {
      await axios
        .delete(`/api/courses/${params.courseId}/sub/${id}`)
        .catch((e) => {
          console.log("DELETE SUB:", e);
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["subUsers"]);
      toast.success("تم حذف المشترك بنجاح");
    },
  });

  const deleteSub = async (id: string) => {
    setDeleteSubId(id);
    await mutateAsync(id);
    setDeleteSubId("");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchBtn(Math.random().toString());
  };

  return (
    <div className="px-5 md:px-10 py-8">
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

          <Input
            placeholder="بحث برقم الهاتف"
            className="max-w-[300px]"
            onChange={(e) => setSearchPhone(e.target.value)}
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
              data?.data.map((sub: any) => (
                <TableRow key={sub?.id}>
                  <TableCell className="font-medium text-center">
                    {sub?.user?.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {sub?.user?.email}
                  </TableCell>

                  <TableCell className="text-center">
                    <DeleteSubModel
                      onDelete={() => deleteSub(sub?.id)}
                      isLoading={deleteSubId === sub?.id}
                    />
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
