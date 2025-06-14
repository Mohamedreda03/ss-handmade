"use client";

import { useState, useEffect } from "react";
import { OrderStatus } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQueryClient } from "react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

// Status label translation mapping
const statusLabels: Record<OrderStatus, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد المعالجة",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

// Status color mapping
const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

interface ItemStatusControlProps {
  itemId: string;
  currentStatus: OrderStatus;
  orderId: string; // إضافة orderId
}

export default function ItemStatusControl({
  itemId,
  currentStatus,
  orderId,
}: ItemStatusControlProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // تزامن الحالة المحلية مع البيانات الجديدة من API
  useEffect(() => {
    setStatus(currentStatus);
    setHasChanged(false);
  }, [currentStatus]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus !== status) {
      setStatus(newStatus);
      setHasChanged(true);
    }
  };
  const updateItemStatus = async () => {
    try {
      setIsUpdating(true);

      console.log("🔄 بدء تحديث حالة العنصر من الواجهة:", {
        itemId,
        orderId,
        oldStatus: currentStatus,
        newStatus: status,
      });

      const response = await axios.patch(`/api/order-items/${itemId}`, {
        status,
      });

      console.log("✅ استجابة API:", response.data);

      toast.success("تم تحديث حالة المنتج بنجاح");
      setHasChanged(false);

      // إبطال cache وإعادة جلب البيانات فورياً
      console.log("🔄 إبطال cache وإعادة جلب البيانات للطلب:", orderId);
      await queryClient.invalidateQueries(["order", orderId]);
      await queryClient.invalidateQueries(["orders"]);

      // إعادة جلب البيانات فورياً لضمان التحديث
      await queryClient.refetchQueries(["order", orderId]);

      console.log("🔄 تم إبطال cache وإعادة جلب البيانات");
    } catch (error) {
      console.error("❌ خطأ في تحديث حالة العنصر:", error);
      if (axios.isAxiosError(error)) {
        console.error("تفاصيل الخطأ:", error.response?.data);
      }
      toast.error("حدث خطأ أثناء تحديث حالة المنتج");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-2 flex flex-col space-y-2">
      <div className="flex items-center space-x-2 space-x-reverse">
        <span className="text-sm text-gray-600 ml-2">حالة المنتج:</span>
        <span
          className={`inline-flex px-3 py-1 text-xs rounded-full ${statusColors[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Select
          value={status}
          onValueChange={(value) => handleStatusChange(value as OrderStatus)}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تحديث الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">قيد الانتظار</SelectItem>
            <SelectItem value="PROCESSING">قيد المعالجة</SelectItem>
            <SelectItem value="COMPLETED">مكتمل</SelectItem>
            <SelectItem value="CANCELLED">ملغي</SelectItem>
          </SelectContent>
        </Select>

        {hasChanged && (
          <Button
            onClick={updateItemStatus}
            disabled={isUpdating}
            variant="outline"
            size="sm"
            className="mr-2"
          >
            {isUpdating ? "جاري التحديث..." : "تحديث الحالة"}
          </Button>
        )}
      </div>
    </div>
  );
}
