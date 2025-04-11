"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns, Order } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const url = statusFilter
          ? `/api/admin/orders?status=${statusFilter}`
          : "/api/admin/orders";
        const response = await axios.get(url);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <Heading
          title={`الطلبات (${orders.length})`}
          description="إدارة طلبات المتجر"
        />
        <div className="flex gap-2 items-center" dir="rtl">
          <span className="text-sm font-medium">تصفية حسب الحالة:</span>
          <Select
            defaultValue={statusFilter === undefined ? "ALL" : statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value === "ALL" ? undefined : value);
            }}
            dir="rtl"
          >
            <SelectTrigger className="w-[180px] text-right">
              <SelectValue placeholder="كل الطلبات" />
            </SelectTrigger>
            <SelectContent className="text-right">
              <SelectGroup>
                <SelectLabel>حالة الطلب</SelectLabel>
                <SelectItem value="ALL">كل الطلبات</SelectItem>
                <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                <SelectItem value="PROCESSING">قيد التنفيذ</SelectItem>
                <SelectItem value="COMPLETED">مكتمل</SelectItem>
                <SelectItem value="CANCELLED">ملغي</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator className="my-4" />

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <p>جاري تحميل الطلبات...</p>
        </div>
      ) : (
        <div className="mt-6">
          <DataTable
            columns={columns}
            data={orders}
            meta={{
              setData: setOrders,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
