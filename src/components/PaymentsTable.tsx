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
import { Payment } from "@prisma/client";
import { format, isPast } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import axios from "axios";

export default function PaymentsTable({
  payments,
  isLoading,
}: {
  payments: Payment[];
  isLoading: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 5;
  const totalPages = Math.ceil(payments?.length / pageLimit);
  const currentPayments = payments?.slice(
    (currentPage - 1) * pageLimit,
    currentPage * pageLimit
  );

  return (
    <div>
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">المسلسل</TableHead>
            <TableHead className="text-center">تاريخ الانشاء</TableHead>
            <TableHead className="text-center">تاريخ الدفع</TableHead>
            <TableHead className="text-center">المبلغ المالي</TableHead>
            <TableHead className="text-center">حالة كود فوري</TableHead>
            <TableHead className="text-center">الحاله</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-lg">
                <Loading className="h-[200px]" />
              </TableCell>
            </TableRow>
          )}

          {currentPayments?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-lg">
                لا يوجد بيانات
              </TableCell>
            </TableRow>
          )}
          {currentPayments?.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.invoice_id}</TableCell>
              <TableCell className="font-medium text-center">
                {format(payment.createdAt, "yyyy-MM-dd | hh:mm:ss a", {
                  locale: ar,
                })}
              </TableCell>
              <TableCell className="font-medium text-center">
                {payment.payment_time
                  ? format(payment.payment_time, "yyyy-MM-dd | hh:mm:ss a", {
                      locale: ar,
                    })
                  : "لم يتم الدفع"}
              </TableCell>
              <TableCell className="font-medium text-center">
                {payment.amount} جنيها
              </TableCell>

              <TableCell>
                <div
                  className={cn(
                    "font-medium text-center w-fit mx-auto px-4 py-1 rounded-full",
                    {
                      "text-green-500 bg-green-100 border border-green-200":
                        !isPast(new Date(payment.expire_date!)) &&
                        payment.status !== "PAID",
                      "text-red-500 bg-red-100 border border-red-200":
                        isPast(new Date(payment.expire_date!)) ||
                        payment.status === "PAID",
                    }
                  )}
                >
                  {!isPast(new Date(payment.expire_date!)) &&
                  payment.status !== "PAID"
                    ? "غير منتهي"
                    : "منتهي"}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div
                  className={cn(
                    "text-center w-fit mx-auto px-3 py-1 rounded-full",
                    {
                      "text-green-500 bg-gray-100 border border-green-200":
                        payment.status === "PAID",
                      "text-yellow-500 bg-yellow-100 border border-yellow-200":
                        payment.status === "UNPAID",
                    }
                  )}
                >
                  {payment.status === "UNPAID" ? "لم يتم الدفع" : "تم الدفع"}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="mt-3 mb-4">
          <div className="flex items-center gap-3">
            <Button>
              <ArrowRight size={15} className="ml-1.5" />
              <span>التالي</span>
            </Button>
            <div className="flex items-center gap-2 text-lg">
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
            <Button>
              <span>السابق</span>
              <ArrowLeft size={15} className="mr-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
