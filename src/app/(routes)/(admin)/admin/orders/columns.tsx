"use client";

import { ColumnDef, TableMeta } from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { formatPrice } from "@/lib/format";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
};

export type Order = {
  id: string;
  userId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user: {
    name: string;
    email: string;
  };
};

// Status options with their Arabic labels
const statusOptions = [
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "PROCESSING", label: "قيد التنفيذ" },
  { value: "COMPLETED", label: "مكتمل" },
  { value: "CANCELLED", label: "ملغي" },
];

// Helper component to manage status change
const StatusChanger = ({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (newStatus: string) => void;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status) return;

    try {
      setError(null);
      setIsUpdating(true);
      console.log(`Actualizando estado de orden ${order.id} a ${newStatus}...`);

      const response = await axios.patch(`/api/admin/orders/${order.id}`, {
        status: newStatus,
      });
      console.log("Respuesta del servidor:", response.data);

      toast.success("تم تحديث حالة الطلب بنجاح");
      onStatusChange(newStatus);
    } catch (error: any) {
      const errorMessage =
        error.response?.data || error.message || "فشل تحديث حالة الطلب";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error al actualizar estado:", error);
      console.error("Detalles del error:", error.response?.data);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <StatusBadge status={order.status} />
        <Select
          defaultValue={order.status}
          onValueChange={handleStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger
            className={`w-[140px] h-8 text-xs ${error ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder="تغيير الحالة" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isUpdating && (
        <span className="text-xs text-amber-500">جاري التحديث...</span>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

// Extracted badge component for reuse
const StatusBadge = ({ status }: { status: Order["status"] }) => {
  let variant: "default" | "outline" | "secondary" | "destructive" | "success" =
    "default";
  let label = "";

  switch (status) {
    case "PENDING":
      variant = "outline";
      label = "قيد الانتظار";
      break;
    case "PROCESSING":
      variant = "secondary";
      label = "قيد التنفيذ";
      break;
    case "COMPLETED":
      variant = "success";
      label = "مكتمل";
      break;
    case "CANCELLED":
      variant = "destructive";
      label = "ملغي";
      break;
  }

  return <Badge variant={variant}>{label}</Badge>;
};

// Extend TableMeta to include setData
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    setData?: React.Dispatch<React.SetStateAction<TData[]>>;
  }
}

const OrderActions = ({ order }: { order: Order }) => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push(`/admin/orders/${order.id}`)}
    >
      <Eye className="h-4 w-4 ml-1" />
      عرض
    </Button>
  );
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "رقم الطلب",
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.original.id.substring(0, 8)}...</div>
      );
    },
  },
  {
    accessorKey: "user.name",
    header: "العميل",
    cell: ({ row }) => {
      return (
        <div>
          <div>{row.original.user.name || "غير محدد"}</div>
          <div className="text-sm text-gray-500">
            {row.original.user.email || "غير محدد"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          المبلغ الإجمالي
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      return <div>{formatPrice(amount)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row, table }) => {
      // Access the table's setState function to update data
      const { setData } = table.options.meta || {};

      // Handler to update order status in the table data
      const handleStatusChange = (newStatus: string) => {
        if (setData) {
          setData((prevData: Order[]) => {
            return prevData.map((item) => {
              if (item.id === row.original.id) {
                return { ...item, status: newStatus as Order["status"] };
              }
              return item;
            });
          });
        }
      };

      return (
        <StatusChanger
          order={row.original}
          onStatusChange={handleStatusChange}
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          التاريخ
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const order = row.original;

      return <OrderActions order={order} />;
    },
  },
];
