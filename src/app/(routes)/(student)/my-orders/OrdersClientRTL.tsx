"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { OrderStatus } from "@prisma/client";
import { ar } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface OrdersClientProps {
  buyerOrders: any[];
  sellerOrders: any[];
  totalRevenue: number;
}

export function OrdersClientRTL({
  buyerOrders,
  sellerOrders,
  totalRevenue,
}: OrdersClientProps) {
  const [buyerStatusFilter, setBuyerStatusFilter] = useState<string>("all");
  const [sellerStatusFilter, setSellerStatusFilter] = useState<string>("all");

  // Filter buyer orders
  const filteredBuyerOrders = useMemo(() => {
    if (buyerStatusFilter === "all") return buyerOrders;
    return buyerOrders.filter((order) => order.status === buyerStatusFilter);
  }, [buyerOrders, buyerStatusFilter]);

  // Filter seller orders
  const filteredSellerOrders = useMemo(() => {
    if (sellerStatusFilter === "all") return sellerOrders;
    return sellerOrders.filter((order) => order.status === sellerStatusFilter);
  }, [sellerOrders, sellerStatusFilter]);

  const hasNoOrders = buyerOrders.length === 0 && sellerOrders.length === 0;

  if (hasNoOrders) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 min-h-[600px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">لا يوجد طلبات</h1>
          <p className="text-muted-foreground">
            لم تقم بطلب أي منتجات بعد، ولا توجد طلبات لمنتجاتك.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-right">طلباتي</h1>

      <Tabs defaultValue="buyer" className="w-full">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="seller" className="flex-1 text-right">
            طلبات منتجاتي ({sellerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="buyer" className="flex-1 text-right">
            طلباتي كمشتري ({buyerOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buyer" className="space-y-6">
          {buyerOrders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا توجد طلبات
              </h3>
              <p className="text-gray-500 mb-6">لم تقم بطلب أي منتجات بعد</p>
              <Button asChild>
                <Link href="/products">تصفح المنتجات</Link>
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex justify-between items-center mb-4 flex-row-reverse">
                  <div className="flex items-center gap-4 flex-row-reverse">
                    <Select
                      value={buyerStatusFilter}
                      onValueChange={setBuyerStatusFilter}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          جميع الحالات ({buyerOrders.length})
                        </SelectItem>
                        <SelectItem value="PENDING">
                          قيد الانتظار (
                          {
                            buyerOrders.filter((o) => o.status === "PENDING")
                              .length
                          }
                          )
                        </SelectItem>
                        <SelectItem value="PROCESSING">
                          قيد المعالجة (
                          {
                            buyerOrders.filter((o) => o.status === "PROCESSING")
                              .length
                          }
                          )
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          مكتمل (
                          {
                            buyerOrders.filter((o) => o.status === "COMPLETED")
                              .length
                          }
                          )
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          ملغي (
                          {
                            buyerOrders.filter((o) => o.status === "CANCELLED")
                              .length
                          }
                          )
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm font-medium text-gray-700">
                      فلترة حسب الحالة:
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">طلباتي كمشتري</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table className="text-right">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الإجراءات</TableHead>
                      <TableHead className="text-right">المنتجات</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">عدد المنتجات</TableHead>
                      <TableHead className="text-right">تاريخ الطلب</TableHead>
                      <TableHead className="text-right">رقم الطلب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuyerOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/my-orders/${order.id}`}>
                              عرض التفاصيل
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                            {order.orderItems.slice(0, 2).map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1 flex-row-reverse"
                              >
                                <span className="text-xs text-gray-500">
                                  ×{item.quantity}
                                </span>
                                <span className="text-sm truncate max-w-20">
                                  {item.product.name}
                                </span>
                                {item.product.imageUrl && (
                                  <Image
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    width={24}
                                    height={24}
                                    className="rounded object-cover"
                                  />
                                )}
                              </div>
                            ))}
                            {order.orderItems.length > 2 && (
                              <span className="text-sm text-gray-500 bg-gray-100 rounded-md px-2 py-1">
                                +{order.orderItems.length - 2} أخرى
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={
                              statusColors[order.status as OrderStatus]
                            }
                          >
                            {statusLabels[order.status as OrderStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {order.totalAmount.toFixed(2)} جنيه
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {order.orderItems.length} منتج
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {format(new Date(order.createdAt), "dd MMM yyyy", {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredBuyerOrders.length === 0 &&
                buyerStatusFilter !== "all" && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      لا توجد طلبات بحالة &quot;
                      {statusLabels[buyerStatusFilter as OrderStatus]}&quot;
                    </p>
                  </div>
                )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="seller" className="space-y-6">
          {sellerOrders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا توجد مبيعات
              </h3>
              <p className="text-gray-500 mb-6">لم يتم طلب أي من منتجاتك بعد</p>
              <Button asChild>
                <Link href="/my-products/new">أضف منتجًا جديدًا</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200 text-right">
                  <div className="text-sm text-green-600 mb-1">
                    إجمالي المبيعات
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {totalRevenue.toFixed(2)} جنيه
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 text-right">
                  <div className="text-sm text-blue-600 mb-1">عدد الطلبات</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {sellerOrders.length}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 text-right">
                  <div className="text-sm text-purple-600 mb-1">
                    إجمالي المنتجات المباعة
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    {sellerOrders.reduce(
                      (sum: number, order: any) =>
                        sum +
                        order.orderItems.reduce(
                          (itemSum: number, item: any) =>
                            itemSum + item.quantity,
                          0
                        ),
                      0
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex justify-between items-center mb-4 flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <Select
                        value={sellerStatusFilter}
                        onValueChange={setSellerStatusFilter}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            جميع الحالات ({sellerOrders.length})
                          </SelectItem>
                          <SelectItem value="PENDING">
                            قيد الانتظار (
                            {
                              sellerOrders.filter((o) => o.status === "PENDING")
                                .length
                            }
                            )
                          </SelectItem>
                          <SelectItem value="PROCESSING">
                            قيد المعالجة (
                            {
                              sellerOrders.filter(
                                (o) => o.status === "PROCESSING"
                              ).length
                            }
                            )
                          </SelectItem>
                          <SelectItem value="COMPLETED">
                            مكتمل (
                            {
                              sellerOrders.filter(
                                (o) => o.status === "COMPLETED"
                              ).length
                            }
                            )
                          </SelectItem>
                          <SelectItem value="CANCELLED">
                            ملغي (
                            {
                              sellerOrders.filter(
                                (o) => o.status === "CANCELLED"
                              ).length
                            }
                            )
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm font-medium text-gray-700">
                        فلترة حسب الحالة:
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold">طلبات منتجاتي</h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table className="text-right">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الإجراءات</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">ربحي</TableHead>
                        <TableHead className="text-right">
                          الكمية الإجمالية
                        </TableHead>
                        <TableHead className="text-right">منتجاتي</TableHead>
                        <TableHead className="text-right">المشتري</TableHead>
                        <TableHead className="text-right">
                          تاريخ الطلب
                        </TableHead>
                        <TableHead className="text-right">رقم الطلب</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSellerOrders.map((order: any) => {
                        const totalQuantity = order.orderItems.reduce(
                          (sum: number, item: any) => sum + item.quantity,
                          0
                        );
                        const totalProfit = order.orderItems.reduce(
                          (sum: number, item: any) =>
                            sum + item.price * item.quantity,
                          0
                        );

                        return (
                          <TableRow key={order.id} className="hover:bg-gray-50">
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/my-orders/${order.id}`}>
                                  عرض التفاصيل
                                </Link>
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                className={
                                  statusColors[order.status as OrderStatus]
                                }
                              >
                                {statusLabels[order.status as OrderStatus]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg text-green-600">
                              {totalProfit.toFixed(2)} جنيه
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                {totalQuantity} قطعة
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                                {order.orderItems
                                  .slice(0, 2)
                                  .map((item: any) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-2 bg-green-100 rounded-md px-2 py-1 flex-row-reverse"
                                    >
                                      <span className="text-xs text-green-700 font-medium">
                                        ×{item.quantity}
                                      </span>
                                      <span className="text-sm truncate max-w-20">
                                        {item.product.name}
                                      </span>
                                      {item.product.imageUrl && (
                                        <Image
                                          src={item.product.imageUrl}
                                          alt={item.product.name}
                                          width={24}
                                          height={24}
                                          className="rounded object-cover"
                                        />
                                      )}
                                    </div>
                                  ))}
                                {order.orderItems.length > 2 && (
                                  <span className="text-sm text-gray-500 bg-gray-100 rounded-md px-2 py-1">
                                    +{order.orderItems.length - 2} أخرى
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {order.user.name || "غير محدد"}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {order.user.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {format(
                                new Date(order.createdAt),
                                "dd MMM yyyy",
                                { locale: ar }
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {order.id.slice(0, 8)}...
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {filteredSellerOrders.length === 0 &&
                  sellerStatusFilter !== "all" && (
                    <div className="text-center py-8">
                      {" "}
                      <p className="text-gray-500">
                        لا توجد طلبات بحالة &quot;
                        {statusLabels[sellerStatusFilter as OrderStatus]}&quot;
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
