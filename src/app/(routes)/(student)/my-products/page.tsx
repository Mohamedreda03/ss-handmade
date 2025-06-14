import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Check, Clock, X } from "lucide-react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search: string };
}) {
  const session = await auth();

  const products = await prisma.product.findMany({
    where: {
      name: {
        startsWith: searchParams.search,
      },
      userId: session?.user.id,
      type: "HANDMADE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">منتجاتي</h1>
        <Button asChild>
          <Link href="/my-products/new" className="btn btn-primary">
            اضف منتج جديد
          </Link>
        </Button>
      </div>
      {products.length === 0 ? (
        <div className="text-center p-10 min-h-[500px] py-24">
          <h2 className="text-lg font-semibold mb-4">لا توجد منتجات بعد</h2>
          <p className="text-gray-500">
            يمكنك البدء بإضافة منتج جديد من خلال الضغط على الزر أعلاه.
          </p>
        </div>
      ) : (
        <div className="space-y-4 min-h-[800px]">
          <Table>
            <TableHeader>
              {" "}
              <TableRow>
                <TableHead className="text-start">الرقم</TableHead>
                <TableHead className="text-start">الصوره</TableHead>
                <TableHead className="text-start">اسم المنتج</TableHead>
                <TableHead className="text-start">السعر</TableHead>
                <TableHead className="text-start">حالة الموافقة</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    )}
                  </TableCell>{" "}
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price} EGP</TableCell>
                  <TableCell>
                    {getStatusBadge(product.approvalStatus)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/my-products/${product.id}`}>عرض</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/my-products/${product.id}/edit`}>
                          تعديل
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
