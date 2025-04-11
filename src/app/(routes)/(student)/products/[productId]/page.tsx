import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/products/product-details";
import { BackButton } from "@/components/back-button";

interface ProductPageProps {
  params: {
    productId: string;
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: {
      id: params.productId,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | LMS Platform`,
    description: product.description || "Product details",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: {
      id: params.productId,
      isAvailable: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton href="/products" label="Back to products" />

      <div className="mt-6">
        <ProductDetails product={product} />
      </div>
    </div>
  );
}
