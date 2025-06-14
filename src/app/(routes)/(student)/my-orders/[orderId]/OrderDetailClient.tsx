"use client";

import { useQuery } from "react-query";
import axios from "axios";
import { format } from "date-fns";
import { OrderStatus } from "@prisma/client";
import { ar } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import ItemStatusControl from "./components/item-status-control";
import { useEffect } from "react";

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

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    userId: string;
    User: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  phoneNumber?: string;
  address?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

interface OrderDetailClientProps {
  orderId: string;
  userId: string;
}

export default function OrderDetailClient({
  orderId,
  userId,
}: OrderDetailClientProps) {
  // استخدام React Query مباشرة للحصول على الطلب
  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>(["order", orderId], async () => {
    const response = await axios.get(`/api/orders/${orderId}`);
    return response.data;
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold">جاري تحميل تفاصيل الطلب...</h1>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 min-h-[600px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">الطلب غير موجود</h1>
          <p className="text-muted-foreground">
            لم يتم العثور على الطلب المطلوب أو ليس لديك صلاحية الوصول إليه.
          </p>
          <Link
            href="/my-orders"
            className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md"
          >
            العودة إلى طلباتي
          </Link>
        </div>
      </div>
    );
  }
  // Check if user is a seller in this order
  const userIsSeller = order.orderItems.some(
    (item: OrderItem) => item.product.userId === userId
  );

  // Check if user is the buyer
  const userIsBuyer = order.user.id === userId;

  // Determine view mode: if user is both buyer and seller, show mixed view
  // If user is only seller, show seller view
  // If user is only buyer, show buyer view
  const viewMode =
    userIsSeller && userIsBuyer ? "mixed" : userIsSeller ? "seller" : "buyer";

  // Filter items to separate buyer items from seller items
  const buyerItems = userIsBuyer ? order.orderItems : [];
  const sellerItems = userIsSeller
    ? order.orderItems.filter(
        (item: OrderItem) => item.product.userId === userId
      )
    : [];
  // Calculate totals
  const buyerTotal = buyerItems.reduce(
    (acc: number, item: OrderItem) => acc + item.price * item.quantity,
    0
  );
  const sellerTotal = sellerItems.reduce(
    (acc: number, item: OrderItem) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/my-orders"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          العودة إلى طلباتي
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-right">
                تفاصيل الطلب #{order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-500 text-right mt-1">
                تاريخ الطلب:{" "}
                {format(new Date(order.createdAt), "dd MMMM yyyy", {
                  locale: ar,
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusColors[order.status as OrderStatus]
              }`}
            >
              {statusLabels[order.status as OrderStatus]}
            </span>
          </div>

          {/* معلومات المشتري - تظهر دائمًا */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="font-semibold text-lg mb-2 text-right">
              معلومات المشتري
            </h2>
            <div className="flex flex-col space-y-1 text-right">
              <p>
                <span className="font-medium">الاسم:</span>{" "}
                {order.user.name || "غير محدد"}
              </p>
              <p>
                <span className="font-medium">البريد الإلكتروني:</span>{" "}
                {order.user.email || "غير محدد"}
              </p>
              {/* إضافة عنوان التوصيل ورقم الهاتف */}{" "}
              <p>
                <span className="font-medium">رقم الهاتف:</span>{" "}
                {(order as any).phoneNumber || "غير محدد"}
              </p>
              <p>
                <span className="font-medium">عنوان التوصيل:</span>{" "}
                {(order as any).address || "غير محدد"}
              </p>
            </div>
          </div>

          {viewMode === "buyer" ? (
            // عرض المنتجات للمشتري فقط
            <div>
              <h2 className="font-semibold text-xl mb-4 text-right">
                منتجات الطلب الخاص بك
              </h2>{" "}
              <div className="border rounded-md overflow-hidden">
                <div className="divide-y">
                  {buyerItems.map((item: OrderItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center space-x-4 space-x-reverse rtl">
                        {item.product.imageUrl && (
                          <div className="h-16 w-16 relative bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="object-cover"
                              style={{ width: "100%", height: "100%" }}
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-right">
                            {item.product.name}
                          </h4>
                          <div className="flex space-x-4 space-x-reverse text-sm text-gray-500">
                            <span>الكمية: {item.quantity}</span>
                            <span>السعر: {item.price} جنيه</span>
                          </div>
                          {item.product.User && (
                            <p className="text-sm text-gray-500 mt-1">
                              البائع: {item.product.User.name || "غير معروف"}
                            </p>
                          )}
                          {/* عرض حالة المنتج للقراءة فقط للمشتري */}
                          <div className="mt-2">
                            <span
                              className={`inline-flex px-3 py-1 text-xs rounded-full ${
                                statusColors[item.status as OrderStatus]
                              }`}
                            >
                              {statusLabels[item.status as OrderStatus]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-right">
                        {(item.price * item.quantity).toFixed(2)} جنيه
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === "seller" ? (
            // عرض المنتجات للبائع فقط
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  أنت ترى المنتجات التي طلبها العملاء منك
                </div>
                <h2 className="font-semibold text-xl text-right">
                  منتجاتك في هذا الطلب
                </h2>
              </div>{" "}
              <div className="border rounded-md overflow-hidden">
                <div className="divide-y">
                  {sellerItems.map((item: OrderItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center space-x-4 space-x-reverse rtl">
                        {item.product.imageUrl && (
                          <div className="h-16 w-16 relative bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="object-cover"
                              style={{ width: "100%", height: "100%" }}
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-right">
                            {item.product.name}
                            <span className="mr-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              منتجك
                            </span>
                          </h4>
                          <div className="flex space-x-4 space-x-reverse text-sm text-gray-500">
                            <span>الكمية: {item.quantity}</span>
                            <span>السعر: {item.price} جنيه</span>
                          </div>

                          {/* عنصر تحكم بحالة المنتج للبائع فقط */}
                          <div className="mt-2">
                            <ItemStatusControl
                              itemId={item.id}
                              currentStatus={item.status as OrderStatus}
                              orderId={orderId}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-right">
                        {(item.price * item.quantity).toFixed(2)} جنيه
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // عرض مختلط للمستخدم الذي هو مشتري وبائع في نفس الطلب
            <div className="space-y-8">
              {/* قسم المشتريات */}
              {buyerItems.length > 0 && (
                <div>
                  <h2 className="font-semibold text-xl mb-4 text-right">
                    مشترياتك من هذا الطلب
                  </h2>
                  <div className="border rounded-md overflow-hidden">
                    {" "}
                    <div className="divide-y">
                      {buyerItems.map((item: OrderItem) => (
                        <div
                          key={`buyer-${item.id}`}
                          className="flex items-center justify-between p-4 bg-blue-50"
                        >
                          <div className="flex items-center space-x-4 space-x-reverse rtl">
                            {item.product.imageUrl && (
                              <div className="h-16 w-16 relative bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  width={64}
                                  height={64}
                                  className="object-cover"
                                  style={{ width: "100%", height: "100%" }}
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-right">
                                {item.product.name}
                                <span className="mr-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  اشتريته
                                </span>
                              </h4>
                              <div className="flex space-x-4 space-x-reverse text-sm text-gray-500">
                                <span>الكمية: {item.quantity}</span>
                                <span>السعر: {item.price} جنيه</span>
                              </div>
                              {item.product.User && (
                                <p className="text-sm text-gray-500 mt-1">
                                  البائع:{" "}
                                  {item.product.User.name || "غير معروف"}
                                </p>
                              )}
                              {/* عرض حالة المنتج للقراءة فقط */}
                              <div className="mt-2">
                                <span
                                  className={`inline-flex px-3 py-1 text-xs rounded-full ${
                                    statusColors[item.status as OrderStatus]
                                  }`}
                                >
                                  {statusLabels[item.status as OrderStatus]}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold text-right">
                            {(item.price * item.quantity).toFixed(2)} جنيه
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* قسم المبيعات */}
              {sellerItems.length > 0 && (
                <div>
                  <h2 className="font-semibold text-xl mb-4 text-right">
                    مبيعاتك من هذا الطلب
                  </h2>
                  <div className="border rounded-md overflow-hidden">
                    {" "}
                    <div className="divide-y">
                      {sellerItems.map((item: OrderItem) => (
                        <div
                          key={`seller-${item.id}`}
                          className="flex items-center justify-between p-4 bg-green-50"
                        >
                          <div className="flex items-center space-x-4 space-x-reverse rtl">
                            {item.product.imageUrl && (
                              <div className="h-16 w-16 relative bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  width={64}
                                  height={64}
                                  className="object-cover"
                                  style={{ width: "100%", height: "100%" }}
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-right">
                                {item.product.name}
                                <span className="mr-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  بعته
                                </span>
                              </h4>
                              <div className="flex space-x-4 space-x-reverse text-sm text-gray-500">
                                <span>الكمية: {item.quantity}</span>
                                <span>السعر: {item.price} جنيه</span>
                              </div>

                              {/* عنصر تحكم بحالة المنتج للبائع */}
                              <div className="mt-2">
                                <ItemStatusControl
                                  itemId={item.id}
                                  currentStatus={item.status as OrderStatus}
                                  orderId={orderId}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold text-right">
                            {(item.price * item.quantity).toFixed(2)} جنيه
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-end items-end">
              <div>
                {viewMode === "mixed" ? (
                  // إجمالي مختلط للمشتري والبائع
                  <div className="space-y-2">
                    {buyerItems.length > 0 && (
                      <div className="text-gray-600 mb-1 text-right">
                        <span className="text-blue-600">مدفوع:</span>{" "}
                        <span className="font-bold">
                          {buyerTotal.toFixed(2)} جنيه
                        </span>
                      </div>
                    )}
                    {sellerItems.length > 0 && (
                      <div className="text-gray-600 mb-1 text-right">
                        <span className="text-green-600">مكسوب:</span>{" "}
                        <span className="font-bold">
                          {sellerTotal.toFixed(2)} جنيه
                        </span>
                      </div>
                    )}
                    <div className="text-gray-600 mb-1 text-right border-t pt-2">
                      <span>الربح الصافي:</span>{" "}
                      <span className="text-2xl font-bold">
                        {(sellerTotal - buyerTotal).toFixed(2)} جنيه
                      </span>
                    </div>
                  </div>
                ) : (
                  // إجمالي عادي للمشتري أو البائع فقط
                  <div>
                    <div className="text-gray-600 mb-1 text-right">
                      {viewMode === "buyer"
                        ? "إجمالي الطلب:"
                        : "إجمالي المبيعات من منتجاتك:"}
                    </div>
                    <div className="text-2xl font-bold text-right">
                      {viewMode === "buyer"
                        ? buyerTotal.toFixed(2)
                        : sellerTotal.toFixed(2)}{" "}
                      جنيه
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
