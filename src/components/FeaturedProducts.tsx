import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "./products/product-card";

interface FeaturedProductsProps {
  products: Product[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2 text-primary">
            المنتجات المميزة
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            استكشف مجموعة مختارة من المنتجات اليدوية الفريدة التي تعكس الحرفية
            والإبداع.
          </p>
        </div>

        {products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد منتجات متاحة حاليًا.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-block border border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-primary hover:text-white transition"
          >
            عرض جميع المنتجات
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
