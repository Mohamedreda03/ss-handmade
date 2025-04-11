import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { OrderStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { ar } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch orders made by the user (as a buyer)
  const buyerOrders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch orders that include products owned by the user (as a seller)
  // This optimized query uses the new index on OrderItem.productId
  const sellerOrders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          product: {
            userId: session.user.id,
          },
        },
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          id: true, // Include user ID for reference
        },
      },
      orderItems: {
        include: {
          product: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        // Only include items from products owned by this seller
        where: {
          product: {
            userId: session.user.id,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate total revenue from products owned by the user
  const totalRevenue = sellerOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((subtotal, item) => {
      return subtotal + item.price * item.quantity;
    }, 0);
    return total + orderTotal;
  }, 0);

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
      <h1 className="text-3xl font-bold text-right mb-6">طلباتي</h1>

      <Tabs defaultValue="seller" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="buyer" className="flex-1">
            طلباتي كمشتري
          </TabsTrigger>
          <TabsTrigger value="seller" className="flex-1">
            طلبات منتجاتي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buyer">
          {buyerOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                لم تقم بطلب أي منتجات بعد.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md"
              >
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {buyerOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow"
                >
                  <div className="p-4 bg-gray-50 border-b flex flex-wrap justify-between items-center">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                      <span className="text-sm text-gray-500">
                        رقم الطلب: {order.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      {format(new Date(order.createdAt), "dd MMMM yyyy", {
                        locale: ar,
                      })}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">
                        عدد المنتجات: {order.orderItems.length}
                      </span>
                      <div className="font-semibold text-right">
                        إجمالي الطلب: {order.totalAmount.toFixed(2)} جنيه
                      </div>
                    </div>

                    <div className="space-y-4 mt-4">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
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
                              <h3 className="font-medium text-right">
                                {item.product.name}
                              </h3>
                              <div className="flex space-x-4 space-x-reverse text-sm text-gray-500">
                                <span>الكمية: {item.quantity}</span>
                                <span>السعر: {item.price} جنيه</span>
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
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="seller">
          {sellerOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                لم يتم طلب أي من منتجاتك بعد.
              </p>
              <Link
                href="/dashboard/products/new"
                className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md"
              >
                أضف منتجًا جديدًا
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {sellerOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg overflow-hidden bg-white shadow"
                >
                  <div className="p-4 bg-gray-50 border-b flex flex-wrap justify-between items-center">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                      <span className="text-sm text-gray-500">
                        رقم الطلب: {order.id.slice(0, 8)}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        منتجاتك فقط
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      {format(new Date(order.createdAt), "dd MMMM yyyy", {
                        locale: ar,
                      })}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-right mb-1">
                        تفاصيل المشتري:
                      </h3>
                      <p className="text-sm text-gray-700 text-right">
                        الاسم: {order.user.name || "غير محدد"}
                      </p>
                      <p className="text-sm text-gray-700 text-right">
                        البريد الإلكتروني: {order.user.email || "غير محدد"}
                      </p>
                    </div>

                    <h3 className="font-medium text-right mb-3 flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5 ml-2">
                        منتجاتك
                      </span>
                      المنتجات الخاصة بك في هذا الطلب:
                    </h3>
                    <div className="space-y-4">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
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
                              <h3 className="font-medium text-right">
                                {item.product.name}
                                <span className="mr-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  منتجك
                                </span>
                              </h3>
                              <div className="flex space-x-4 space-x-reverse text-sm text-gray-500">
                                <span>الكمية: {item.quantity}</span>
                                <span>السعر: {item.price} جنيه</span>
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold text-right">
                            {(item.price * item.quantity).toFixed(2)} جنيه
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t text-right">
                      <div className="flex justify-between items-center">
                        <Link
                          href={`/my-orders/${order.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          عرض تفاصيل كاملة
                        </Link>
                        <div>
                          <span className="font-semibold">إجمالي منتجاتك:</span>
                          <span className="font-bold text-xl mr-2">
                            {order.orderItems
                              .reduce(
                                (acc, item) => acc + item.price * item.quantity,
                                0
                              )
                              .toFixed(2)}{" "}
                            جنيه
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
