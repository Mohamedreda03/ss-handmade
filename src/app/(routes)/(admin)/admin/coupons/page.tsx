"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  PlusCircle,
  Search,
} from "lucide-react";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Coupon } from "@prisma/client";
import DeleteCouponModel from "@/components/admin_dashboard/coupons/DeleteTestDataModel";
import Link from "next/link";
import Pagenation from "@/components/Pagenation";

export default function Coupons() {
  // &page=${currentPage}&pageSize=${pageSize}&code=${code}
  const pageSize = 15;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchCode, setSearchCode] = useState<string>("");
  const [searchBtn, setSearchBtn] = useState<string>("1");

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["coupons", currentPage, searchBtn],
    queryFn: async () => {
      const res = await axios.get(
        `/api/coupons?page=${currentPage}&pageSize=${pageSize}&code=${searchCode}`
      );

      setCurrentPage(res.data.meta.currentPage);
      setSearchTotalPages(res.data.meta.totalPages);

      return res.data.data;
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (couponId: string) => {
      await axios.delete(`/api/coupons/${couponId}`);
    },
  });

  const onDeleteCoupon = async (couponId: string) => {
    await mutateAsync(couponId);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchBtn(Math.random().toString());
  };

  return (
    <div className="p-5 md:p-10">
      <div className="mb-7">
        <Button asChild>
          <Link href="/admin/coupons/create_coupons">
            <span>إضافة كوبون</span>
            <PlusCircle size={17} className="mr-1.5" />
          </Link>
        </Button>
      </div>
      <div>
        <form
          onSubmit={handleSearch}
          className="mb-4 flex items-center flex-col sm:flex-row gap-3"
        >
          <Input
            placeholder="بحث بالكوبون"
            className="max-w-[300px]"
            onChange={(e) => setSearchCode(e.target.value)}
            disabled={dataLoading}
          />

          <div>
            <Button disabled={dataLoading} className="mt-auto" type="submit">
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
              <TableHead className="text-center">الكوبون</TableHead>
              <TableHead className="text-center">قيمة الكوبون</TableHead>
              <TableHead className="text-center">الحلة</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          {data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-lg">
                لا يوجد بيانات
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {data &&
              data?.map((coupon: Coupon) => (
                <TableRow key={coupon?.id}>
                  <TableCell className="font-medium text-center">
                    {coupon?.code}
                  </TableCell>
                  <TableCell className="text-center">
                    <div>
                      <span>{coupon?.value}</span>
                      <span className="mr-1.5">جنية</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={cn({
                          "text-green-400": coupon?.isUsed,
                        })}
                      >
                        {coupon?.isUsed ? "تم استخدام الكود" : "غير مستخدم"}
                      </span>
                      <BadgeCheck
                        size={16}
                        className={cn("text-green-500", {
                          hidden: !coupon?.isUsed,
                        })}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <DeleteCouponModel
                      onDelete={() => onDeleteCoupon(coupon?.id)}
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
