import Link from "next/link";
import Image from "next/image";
// import { useQuery } from "react-query";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          المنتج غير موجود
        </div>
        <Link href="/products" className="text-blue-500 hover:underline">
          العودة إلى المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[800px]">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/my-products">العودة إلى المنتجات</Link>
          </Button>
          <Button asChild>
            <Link href={`/my-products/${product.id}/edit`}>تعديل المنتج</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-80 md:h-96 bg-gray-100 rounded">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              className="rounded"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              No Image Available
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  product.type === "HANDMADE"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {product.type === "HANDMADE"
                  ? "Handmade Product"
                  : "Equipment/Tools"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold">
              EGP {product.price.toFixed(2)}
            </h3>
            <p
              className={`mt-1 ${
                product.isAvailable ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.isAvailable ? "المنتج متاح" : "المنتج غير متاح"}
            </p>
            <p className="bg-slate-200 rounded-full w-fit px-3 py-1 mt-2">
              <span className="font-medium mr-2">stock</span>
              {product.stock}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">وصف المنتج</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="text-lg text-gray-500">
            <p>
              تم اضافته في {new Date(product.createdAt).toLocaleDateString()}
            </p>
            <p>اخر تحديث {new Date(product.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
