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
import {
  Search,
  Check,
  X,
  Clock,
  User,
  Package,
  Filter,
  Hammer,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "react-query";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
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
import Pagenation from "../Pagenation";

export default function ProductsManagement() {
  const pageSize = 15;
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | "PENDING" | "APPROVED" | "REJECTED"
  >("all");
  const [searchBtn, setSearchBtn] = useState<string>("1");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["admin-products", currentPage, searchBtn, approvalFilter],
    queryFn: async () => {
      const res = await axios.get(
        `/api/admin/products?search=${searchQuery}&approvalStatus=${approvalFilter}&page=${currentPage}&pageSize=${pageSize}`
      );

      setCurrentPage(res.data.meta.currentPage);
      setSearchTotalPages(res.data.meta.totalPages);

      return res.data;
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchBtn(Math.random().toString());
  };
  const handleApproval = async (
    productId: string,
    action: "approve" | "reject"
  ) => {
    const loadingKey = `${productId}-${action}`;

    setLoadingStates((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      await axios.patch(`/api/admin/products/${productId}/approval`, {
        action,
      });

      toast({
        title: action === "approve" ? "تم قبول المنتج" : "تم رفض المنتج",
        description: `تم ${action === "approve" ? "قبول" : "رفض"} المنتج بنجاح`,
        variant: "default",
      });

      queryClient.invalidateQueries(["admin-products"]);
    } catch (error: any) {
      console.error("Error in product approval:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة المنتج",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            في انتظار الموافقة
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            مقبول
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            مرفوض
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4" dir="rtl">
          إدارة المنتجات
        </h1>

        {/* Filter Section */}
        <div className="mb-4">
          <div
            className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border"
            dir="rtl"
          >
            <span className="text-sm font-medium text-gray-700 ml-3">
              فلترة حسب الحالة:
            </span>
            <div className="flex gap-2">
              {[
                { value: "all", label: "جميع المنتجات", icon: Package },
                { value: "PENDING", label: "في انتظار الموافقة", icon: Clock },
                { value: "APPROVED", label: "مقبولة", icon: Check },
                { value: "REJECTED", label: "مرفوضة", icon: X },
              ].map((filter) => {
                const IconComponent = filter.icon;
                return (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setApprovalFilter(filter.value as any);
                      setCurrentPage(1);
                      setSearchBtn(Math.random().toString());
                    }}
                    className={cn(
                      "px-3 py-1 rounded-md text-sm transition-all duration-200 flex items-center gap-1",
                      approvalFilter === filter.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border"
                    )}
                    disabled={dataLoading}
                  >
                    <IconComponent className="h-4 w-4" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>{" "}
        </div>

        <form onSubmit={handleSearch}>
          <div className="flex items-center mb-4" dir="rtl">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
              <div className="relative">
                <Input
                  placeholder="ابحث عن المنتجات..."
                  className="w-80 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={dataLoading}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>

              <Button
                disabled={dataLoading}
                className="flex items-center gap-2"
              >
                {dataLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search size={16} />
                )}
                <span>بحث</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {dataLoading ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">جاري التحميل...</span>
        </div>
      ) : (
        <>
          {data?.data && data.data.length > 0 && (
            <div className="mb-4 text-center text-sm text-gray-600" dir="rtl">
              تم العثور على {data.meta.totalProducts} منتج
            </div>
          )}

          <Table
            dir="rtl"
            className="mb-8 border shadow-sm rounded-lg overflow-hidden"
          >
            {" "}
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">اسم المنتج</TableHead>
                <TableHead className="text-center">النوع</TableHead>
                <TableHead className="text-center">المنشئ</TableHead>
                <TableHead className="text-center">السعر</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            {data?.data.length === 0 && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-lg py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-gray-100 rounded-full">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">
                          لا توجد منتجات
                        </p>
                        <p className="text-sm text-muted-foreground">
                          لم يتم العثور على أي منتجات تطابق البحث
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
            <TableBody>
              {data &&
                data?.data.map((product: any) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {" "}
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {product.type === "HANDMADE" ? (
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-800"
                          >
                            <Hammer className="h-3 w-3 mr-1" />
                            منتج يدوي
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-blue-100 text-blue-800"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            معدات
                          </Badge>
                        )}
                      </div>
                    </TableCell>{" "}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-sm">
                          {" "}
                          {product.User ? (
                            <>
                              <div className="font-medium">
                                {product.User.name}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {product.User.role === "STUDENT"
                                  ? "طالب"
                                  : product.User.role === "CONSTRUCTOR"
                                  ? "مدرب"
                                  : product.User.role === "ADMIN"
                                  ? "مدير"
                                  : "غير محدد"}
                              </div>
                              {product.User.email && (
                                <div className="text-gray-400 text-xs">
                                  {product.User.email}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="font-medium text-red-400">
                                مستخدم محذوف
                              </div>
                              <div className="text-red-300 text-xs">
                                {product.userId
                                  ? `ID: ${product.userId.slice(0, 8)}...`
                                  : "منتج النظام"}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-green-600">
                        {product.price} EGP
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(product.approvalStatus)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-gray-600">
                        {new Date(product.createdAt).toLocaleDateString(
                          "ar-SA"
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {product.approvalStatus === "PENDING" && (
                          <>
                            <AlertDialog>
                              {" "}
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={
                                    loadingStates[`${product.id}-approve`] ||
                                    loadingStates[`${product.id}-reject`]
                                  }
                                >
                                  {loadingStates[`${product.id}-approve`] ? (
                                    <>
                                      <div className="h-4 w-4 ml-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                      جاري القبول...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 ml-1" />
                                      قبول
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent dir="rtl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-right">
                                    تأكيد قبول المنتج
                                  </AlertDialogTitle>                                  <AlertDialogDescription className="text-right">
                                    هل أنت متأكد من أنك تريد قبول منتج &quot;
                                    {product.name}&quot;؟
                                    <br />
                                    سيصبح المنتج متاحاً للعرض والشراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>{" "}
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    disabled={
                                      loadingStates[`${product.id}-approve`]
                                    }
                                  >
                                    إلغاء
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleApproval(product.id, "approve")
                                    }
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={
                                      loadingStates[`${product.id}-approve`]
                                    }
                                  >
                                    {loadingStates[`${product.id}-approve`] ? (
                                      <>
                                        <div className="h-4 w-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        جاري القبول...
                                      </>
                                    ) : (
                                      "تأكيد القبول"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              {" "}
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={
                                    loadingStates[`${product.id}-approve`] ||
                                    loadingStates[`${product.id}-reject`]
                                  }
                                >
                                  {loadingStates[`${product.id}-reject`] ? (
                                    <>
                                      <div className="h-4 w-4 ml-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                      جاري الرفض...
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-4 w-4 ml-1" />
                                      رفض
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent dir="rtl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-right">
                                    تأكيد رفض المنتج
                                  </AlertDialogTitle>                                  <AlertDialogDescription className="text-right">
                                    هل أنت متأكد من أنك تريد رفض منتج &quot;
                                    {product.name}&quot;؟
                                    <br />
                                    لن يكون المنتج متاحاً للعرض أو الشراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>{" "}
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    disabled={
                                      loadingStates[`${product.id}-reject`]
                                    }
                                  >
                                    إلغاء
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleApproval(product.id, "reject")
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={
                                      loadingStates[`${product.id}-reject`]
                                    }
                                  >
                                    {loadingStates[`${product.id}-reject`] ? (
                                      <>
                                        <div className="h-4 w-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        جاري الرفض...
                                      </>
                                    ) : (
                                      "تأكيد الرفض"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {product.approvalStatus !== "PENDING" && (
                          <span className="text-sm text-gray-500">
                            {product.approvalStatus === "APPROVED"
                              ? "تم القبول"
                              : "تم الرفض"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </>
      )}

      {searchTotalPages > 1 && (
        <Pagenation
          currentPage={currentPage}
          searchTotalPages={searchTotalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}
