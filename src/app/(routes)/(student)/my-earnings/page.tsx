import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MyEarningsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Obtener todos los ingresos del vendedor
  const sellerEarnings = await prisma.sellerEarning.findMany({
    where: {
      sellerId: session.user.id,
    },
    include: {
      orderItem: {
        include: {
          product: true,
        },
      },
      order: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calcular estadísticas
  const totalEarnings = sellerEarnings.reduce(
    (sum, earning) => sum + earning.amount,
    0
  );
  const paidEarnings = sellerEarnings
    .filter((earning) => earning.isPaid)
    .reduce((sum, earning) => sum + earning.amount, 0);
  const pendingEarnings = totalEarnings - paidEarnings;
  const totalOrders = new Set(sellerEarnings.map((earning) => earning.orderId))
    .size;
  const totalProducts = sellerEarnings.length;

  return (
    <div className="container mx-auto py-8 px-4  min-h-[700px]">
      <h1 className="text-3xl font-bold text-right mb-6">أرباحي</h1>

      {/* Resumen de ingresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right">
              {formatPrice(totalEarnings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">
              المدفوعات المستلمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right">
              {formatPrice(paidEarnings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">
              المدفوعات المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right text-orange-600">
              {formatPrice(pendingEarnings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">
              إجمالي الطلبات / المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right">
              {totalOrders} / {totalProducts}
            </p>
          </CardContent>
        </Card>
      </div>

      {sellerEarnings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            لم يتم بيع أي منتجات حتى الآن.
          </p>
          <Link
            href="/dashboard/products/new"
            className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md"
          >
            أضف منتجًا جديدًا
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-right">
              تفاصيل المبيعات والإيرادات
            </h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تاريخ البيع</TableHead>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">المشتري</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">إجمالي الإيراد</TableHead>
                  <TableHead className="text-right">حالة الدفع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerEarnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell className="text-right">
                      {format(new Date(earning.createdAt), "dd MMMM yyyy", {
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/my-orders/${earning.orderId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {earning.orderId.slice(0, 8)}...
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-3 space-x-reverse">
                        {earning.orderItem.product.imageUrl && (
                          <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={earning.orderItem.product.imageUrl}
                              alt={earning.orderItem.product.name}
                              width={40}
                              height={40}
                              className="object-cover h-full w-full"
                            />
                          </div>
                        )}
                        <span>{earning.orderItem.product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {earning.order.user.name ||
                        earning.order.user.email ||
                        "غير معروف"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(earning.orderItem.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {earning.orderItem.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(earning.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={earning.isPaid ? "success" : "outline"}
                        className={
                          earning.isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {earning.isPaid ? "تم الدفع" : "معلق"}
                      </Badge>
                      {earning.isPaid && earning.paidAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(earning.paidAt), "dd/MM/yyyy", {
                            locale: ar,
                          })}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
