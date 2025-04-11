"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import axios from "axios";
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
}

export default function ItemStatusControl({
  itemId,
  currentStatus,
}: ItemStatusControlProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus !== status) {
      setStatus(newStatus);
      setHasChanged(true);
    }
  };

  const updateItemStatus = async () => {
    try {
      setIsUpdating(true);

      await axios.patch(`/api/order-items/${itemId}`, { status });

      toast.success("تم تحديث حالة المنتج بنجاح");
      setHasChanged(false);
    } catch (error) {
      console.error("Error updating item status:", error);
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
