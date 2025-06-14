"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { useState } from "react";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
  isAvailable: boolean;
  type: "HANDMADE" | "EQUIPMENT";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  orderItems?: Array<{
    id: string;
    quantity: number;
  }>;
  Coupon?: Array<{
    id: string;
    code: string;
  }>;
  User?: {
    id: string;
    name: string;
  } | null;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "imageUrl",
    header: ({ column }) => (
      <div className="text-center font-medium">الصورة</div>
    ),
    cell: ({ row }) => {
      const imageUrl = row.original.imageUrl;
      return (
        <div className="flex justify-center items-center h-16">
          {imageUrl ? (
            <div className="relative h-12 w-12">
              <Image
                src={imageUrl}
                alt={row.original.name}
                fill
                className="rounded-lg object-cover border"
              />
            </div>
          ) : (
            <div className="h-12 w-12 bg-slate-100 rounded-lg border flex items-center justify-center">
              <span className="text-xs text-gray-400">لا توجد</span>
            </div>
          )}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium text-right w-full justify-start"
        >
          اسم المنتج
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div
          className="font-medium text-right max-w-[200px] truncate"
          title={row.getValue("name")}
        >
          {row.getValue("name")}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium text-center w-full justify-center"
        >
          السعر
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return (
        <div className="text-center font-medium text-green-600">
          {formatPrice(price)}
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <div className="text-center font-medium">نوع المنتج</div>
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <div className="text-center">
          <Badge
            variant={type === "HANDMADE" ? "default" : "secondary"}
            className={
              type === "HANDMADE"
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }
          >
            {type === "HANDMADE" ? "يدوي" : "معدات"}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "approvalStatus",
    header: ({ column }) => (
      <div className="text-center font-medium">حالة الموافقة</div>
    ),
    cell: ({ row }) => {
      const status = row.original.approvalStatus;
      const getStatusConfig = (status: string) => {
        switch (status) {
          case "APPROVED":
            return {
              text: "مقبول",
              className: "bg-green-100 text-green-800 hover:bg-green-200",
            };
          case "REJECTED":
            return {
              text: "مرفوض",
              className: "bg-red-100 text-red-800 hover:bg-red-200",
            };
          case "PENDING":
          default:
            return {
              text: "في انتظار الموافقة",
              className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
            };
        }
      };

      const config = getStatusConfig(status);
      return (
        <div className="text-center">
          <Badge variant="secondary" className={config.className}>
            {config.text}
          </Badge>
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <div className="text-center font-medium">المخزون</div>
    ),
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <div className="text-center">
          <span
            className={`font-medium px-2 py-1 rounded-full text-sm ${
              stock > 10
                ? "bg-green-100 text-green-800"
                : stock > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {stock}
          </span>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "User",
    header: ({ column }) => (
      <div className="text-center font-medium">منشئ المنتج</div>
    ),
    cell: ({ row }) => {
      const user = row.original.User;
      return (
        <div className="text-center">
          {user ? (
            <Badge variant="outline" className="text-slate-700">
              {user.name}
            </Badge>
          ) : (
            <span className="text-gray-500 text-sm">غير محدد</span>
          )}
        </div>
      );
    },
    size: 150,
  },
  {
    id: "orderCount",
    header: ({ column }) => (
      <div className="text-center font-medium">عدد الطلبات</div>
    ),
    cell: ({ row }) => {
      const orderCount = row.original.orderItems?.length || 0;
      return (
        <div className="text-center">
          <div className="flex flex-col items-center gap-1">
            <span
              className={`font-medium text-lg ${
                orderCount > 0 ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {orderCount}
            </span>
            {orderCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <AlertTriangle className="h-3 w-3" />
                <span>محمي</span>
              </div>
            )}
          </div>
        </div>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <div className="text-center font-medium">الإجراءات</div>
    ),    cell: function CellComponent({ row }) {
      const router = useRouter();
      const product = row.original;
      const [isDeleting, setIsDeleting] = useState(false);      const handleDelete = async () => {
        const orderCount = product.orderItems?.length || 0;

        // إذا كان لديه طلبات، لا تسمح بالحذف
        if (orderCount > 0) {
          toast.error(`لا يمكن حذف هذا المنتج لأن لديه ${orderCount} طلب.`);
          return;
        }

        try {
          setIsDeleting(true);
          const response = await axios.delete(
            `/api/admin/products/${product.id}`
          );

          if (response.data.success) {
            toast.success(response.data.message || "تم حذف المنتج بنجاح");
          } else {
            toast.success("تم حذف المنتج بنجاح");
          }

          window.location.reload();
        } catch (error: any) {
          console.error("Delete error:", error);

          if (error.response?.data) {
            const errorData = error.response.data;
            if (typeof errorData === "string") {
              toast.error(errorData);
            } else if (errorData.message) {
              toast.error(errorData.message);
            } else {
              toast.error("حدث خطأ أثناء حذف المنتج");
            }
          } else if (error.response?.status === 400) {
            toast.error("لا يمكن حذف المنتج لوجود طلبات عليه.");
          } else if (error.response?.status === 404) {
            toast.error("المنتج غير موجود");
          } else {
            toast.error("حدث خطأ أثناء حذف المنتج");
          }
        } finally {
          setIsDeleting(false);
        }
      };      const orderCount = product.orderItems?.length || 0;
      const couponCount = product.Coupon?.length || 0;
      const canDelete = orderCount === 0;

      return (
        <div className="flex items-center justify-center gap-2 h-16">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/products/${product.id}`)}
            title="تعديل المنتج"
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={canDelete ? "destructive" : "secondary"}
                size="sm"
                disabled={!canDelete}
                title={
                  canDelete
                    ? "حذف المنتج"
                    : "لا يمكن الحذف - يوجد طلبات على هذا المنتج"
                }
                className={`h-8 w-8 p-0 ${
                  !canDelete ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-right">
                  تأكيد حذف المنتج
                </AlertDialogTitle>
                <AlertDialogDescription className="text-right">
                  هل أنت متأكد من أنك تريد حذف المنتج &quot;{product.name}&quot;؟
                  <br />
                  {couponCount > 0 && (
                    <>
                      <br />
                      <span className="text-amber-600">
                        تحذير: سيتم أيضاً حذف {couponCount} كوبون مرتبط بهذا المنتج.
                      </span>
                    </>
                  )}
                  <br />
                  <span className="text-red-600 font-medium">
                    هذا الإجراء لا يمكن التراجع عنه.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  إلغاء
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4 ml-2" />
                      حذف المنتج
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
    size: 120,
  },
];
