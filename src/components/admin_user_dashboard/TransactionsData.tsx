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

import { History, User } from "@prisma/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "react-query";
import Link from "next/link";
import Loading from "../Loading";
import { ActionTypes } from "@/utils/actionsTypes";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Pagenation from "../Pagenation";

interface TransactionsDataProps {
  userId: string;
}

const filterUsers = [
  ActionTypes.CENTER_CODE,
  ActionTypes.ONLINE_PAYMENT,
  ActionTypes.SUBSCRIPTION,
  ActionTypes.CENTER_PAYMENT,
];

export default function TransactionsData({ userId }: TransactionsDataProps) {
  const pageSize = 15;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["userHistory", currentPage],
    queryFn: async () => {
      const res = await axios.get(
        `/api/history/${userId}?page=${currentPage}&pageSize=${pageSize}`
      );

      setCurrentPage(res.data.meta.currentPage);
      setSearchTotalPages(res.data.meta.totalPages);

      return res.data;
    },
  });

  return (
    <div>
      {dataLoading ? (
        <Loading className="h-[300px]" />
      ) : (
        <Table dir="rtl" className="mb-8 border">
          <TableHeader>
            <TableRow>
              {/* <TableHead className="text-center">أسم المستخدم</TableHead> */}
              <TableHead className="text-center">تاريخ العمليه</TableHead>
              <TableHead className="text-center">القيمة</TableHead>
              {/* <TableHead className="text-center"></TableHead> */}
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
              data?.data?.map((history: History) => (
                <TableRow key={history?.id}>
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
