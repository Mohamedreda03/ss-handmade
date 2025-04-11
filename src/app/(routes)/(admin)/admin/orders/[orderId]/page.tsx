"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "../columns";
import { format } from "date-fns";
import { formatPrice } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { OrderStatus } from "@prisma/client";

// Extended types to include seller payment information
interface SellerEarning {
  id: string;
  sellerId: string;
  orderItemId: string;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
  seller: {
    name: string;
    email: string;
  };
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  status: OrderStatus; // Añadimos el estado individual del producto
  product: {
    name: string;
    userId: string | null;
    User?: {
      name: string;
      email: string;
    };
  };
  sellerEarning?: SellerEarning;
}

interface ExtendedOrder extends Omit<Order, "orderItems"> {
  orderItems: OrderItem[];
  phoneNumber?: string; // Add phoneNumber property
  address?: string; // Add address property
}

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

// Status label translation mapping
const statusLabels: Record<OrderStatus, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد المعالجة",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

// Status color variant mapping
const statusVariants: Record<OrderStatus, string> = {
  PENDING: "outline",
  PROCESSING: "secondary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const OrderDetailsPage = ({ params }: OrderDetailsPageProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState<
    Record<string, boolean>
  >({});
  const { orderId } = params;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        toast.error("خطأ في جلب بيانات الطلب");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await axios.patch(`/api/admin/orders/${orderId}`, { status: newStatus });
      toast.success("تم تحديث حالة الطلب بنجاح");

      // Update local order state
      if (order) {
        setOrder({
          ...order,
          status: newStatus as any,
        });
      }
    } catch (error) {
      toast.error("فشل تحديث حالة الطلب");
      console.error(error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleItemStatusUpdate = async (
    itemId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await axios.patch(`/api/order-items/${itemId}`, { status: newStatus });
      toast.success("تم تحديث حالة المنتج بنجاح");

      // Update local state
      if (order) {
        setOrder({
          ...order,
          orderItems: order.orderItems.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                status: newStatus,
              };
            }
            return item;
          }),
        });
      }
    } catch (error) {
      toast.error("فشل تحديث حالة المنتج");
      console.error(error);
    }
  };

  const handlePaymentStatusUpdate = async (
    sellerEarningId: string,
    isPaid: boolean
  ) => {
    if (!order || !sellerEarningId) return;

    setUpdatingPaymentStatus((prev) => ({ ...prev, [sellerEarningId]: true }));

    try {
      await axios.patch(`/api/admin/seller-earnings/${sellerEarningId}`, {
        isPaid,
      });
      toast.success(
        isPaid
          ? "تم تحديث حالة الدفع إلى مدفوع"
          : "تم تحديث حالة الدفع إلى غير مدفوع"
      );

      // Update local state
      setOrder({
        ...order,
        orderItems: order.orderItems.map((item) => {
          if (item.sellerEarning?.id === sellerEarningId) {
            return {
              ...item,
              sellerEarning: {
                ...item.sellerEarning,
                isPaid,
                paidAt: isPaid ? new Date().toISOString() : null,
              },
            };
          }
          return item;
        }),
      });
    } catch (error) {
      toast.error("فشل تحديث حالة الدفع");
      console.error(error);
    } finally {
      setUpdatingPaymentStatus((prev) => ({
        ...prev,
        [sellerEarningId]: false,
      }));
    }
  };

  if (!order && loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-60">
          <p>جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-60">
          <p>لم يتم العثور على الطلب</p>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          variant: "outline" as const,
          label: "قيد الانتظار",
        };
      case "PROCESSING":
        return {
          variant: "secondary" as const,
          label: "قيد التنفيذ",
        };
      case "COMPLETED":
        return {
          variant: "success" as const,
          label: "مكتمل",
        };
      case "CANCELLED":
        return {
          variant: "destructive" as const,
          label: "ملغي",
        };
      default:
        return {
          variant: "outline" as const,
          label: "غير معروف",
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  // Check if there are seller products in the order
  const hasSellerProducts = order.orderItems.some((item) => item.sellerEarning);

  // Calculate completion status of the order
  const completedItems = order.orderItems.filter(
    (item) => item.status === "COMPLETED"
  ).length;
  const totalItems = order.orderItems.length;
  const orderProgress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading
          title={`تفاصيل الطلب #${order.id.substring(0, 8)}`}
          description="عرض وإدارة تفاصيل الطلب"
        />
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>
          العودة للطلبات
        </Button>
      </div>
      <Separator className="my-4" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.user.name || "غير محدد"}</p>
            <p className="text-gray-500">{order.user.email || "غير محدد"}</p>
            {order.address && (
              <p className="text-gray-700 mt-2">العنوان: {order.address}</p>
            )}
            {order.phoneNumber && (
              <p className="text-gray-700">رقم الهاتف: {order.phoneNumber}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span>التاريخ:</span>
              <span>{format(new Date(order.createdAt), "dd/MM/yyyy")}</span>
            </div>
            <div className="flex justify بين mb-2">
              <span>المنتجات:</span>
              <span>{order.orderItems.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>اكتمال المنتجات:</span>
              <span>
                {completedItems} من {totalItems} ({orderProgress}%)
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>الإجمالي:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>حالة الطلب</CardTitle>
            <CardDescription>تحديث حالة الطلب الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant={statusInfo.variant} className="text-md px-3 py-1">
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex gap-2 items-center">
              <Select
                defaultValue={order.status}
                onValueChange={handleStatusUpdate}
                disabled={updatingStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                  <SelectItem value="PROCESSING">قيد التنفيذ</SelectItem>
                  <SelectItem value="COMPLETED">مكتمل</SelectItem>
                  <SelectItem value="CANCELLED">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead className="text-center">السعر</TableHead>
                <TableHead className="text-center">الكمية</TableHead>
                <TableHead className="text-center">البائع</TableHead>
                <TableHead className="text-center">حالة المنتج</TableHead>
                <TableHead className="text-center">المجموع</TableHead>
                {hasSellerProducts && (
                  <TableHead className="text-center">
                    حالة الدفع للتاجر
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-center">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">
                    {item.product.User?.name || "غير معروف"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Badge variant={statusVariants[item.status] as any}>
                        {statusLabels[item.status]}
                      </Badge>
                      <Select
                        value={item.status}
                        onValueChange={(value) =>
                          handleItemStatusUpdate(item.id, value as OrderStatus)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="تغيير الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                          <SelectItem value="PROCESSING">
                            قيد المعالجة
                          </SelectItem>
                          <SelectItem value="COMPLETED">مكتمل</SelectItem>
                          <SelectItem value="CANCELLED">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatPrice(item.price * item.quantity)}
                  </TableCell>
                  {hasSellerProducts && (
                    <TableCell className="text-center">
                      {item.sellerEarning ? (
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={item.sellerEarning.isPaid}
                            disabled={
                              updatingPaymentStatus[item.sellerEarning.id] ||
                              false
                            }
                            dir="ltr"
                            onCheckedChange={(checked) =>
                              handlePaymentStatusUpdate(
                                item.sellerEarning!.id,
                                checked
                              )
                            }
                          />
                          <span>
                            {item.sellerEarning.isPaid ? "مدفوع" : "غير مدفوع"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">لا ينطبق</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {hasSellerProducts && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>تفاصيل مستحقات التجار</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاجر</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead className="text-center">المبلغ المستحق</TableHead>
                  <TableHead className="text-center">حالة الدفع</TableHead>
                  <TableHead className="text-center">تاريخ الدفع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems
                  .filter((item) => item.sellerEarning)
                  .map((item) => (
                    <TableRow key={`seller-${item.id}`}>
                      <TableCell>
                        {item.sellerEarning?.seller.name || "غير محدد"}
                        <div className="text-xs text-gray-500">
                          {item.sellerEarning?.seller.email || ""}
                        </div>
                      </TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell className="text-center">
                        {formatPrice(item.sellerEarning?.amount || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            item.sellerEarning?.isPaid ? "success" : "outline"
                          }
                        >
                          {item.sellerEarning?.isPaid ? "مدفوع" : "غير مدفوع"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.sellerEarning?.paidAt
                          ? format(
                              new Date(item.sellerEarning.paidAt),
                              "dd/MM/yyyy"
                            )
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetailsPage;
