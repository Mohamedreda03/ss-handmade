"use client";

import { Product, Role } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "react-query";
import { FaCartShopping } from "react-icons/fa6";
import ProductCard from "../products/product-card";

interface ProductWithCreator extends Product {
  User?: {
    id: string;
    name?: string | null;
    role: Role;
  } | null;
}

// فلتر المنتجات
type FilterType = "all" | "student" | "platform";

const HandmadeProductsSection = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const maxProducts = 6;

  // استخدام React Query لجلب البيانات مع الفلتر
  const { data: products = [], isLoading } = useQuery<ProductWithCreator[]>(
    ["handmade-products", filter],
    async () => {
      const response = await fetch(`/api/handmade-products?filter=${filter}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }
  );

  // عرض عدد محدود من المنتجات (8 كحد أقصى)
  const filteredProducts = products.slice(0, maxProducts);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
    });

    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تم إضافة ${product.name} إلى سلة التسوق الخاصة بك.`,
    });
  };

  return (
    <section className="py-16 bg-[#f5f5f3]">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#5a5a5a]">
            منتجات مصنوعة بحب
          </h2>
          <p className="text-[#777] max-w-2xl mx-auto">
            كل قطعة فنية توضح مهارة وإبداع صانعها وتروي قصة فريدة لتضيف لمسة
            خاصة.
          </p>
        </div>{" "}
        <div className="flex mb-6 justify-center gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`inline-block px-6 py-2 rounded-md border transition-colors ${
              filter === "all"
                ? "bg-[#6c7f60] text-white border-[#6c7f60]"
                : "bg-white text-[#5a5a5a] border-[#ddd] hover:bg-[#6c7f60] hover:text-white"
            }`}
          >
            كل المنتجات
          </button>
          <button
            onClick={() => setFilter("student")}
            className={`inline-block px-6 py-2 rounded-md border transition-colors ${
              filter === "student"
                ? "bg-[#6c7f60] text-white border-[#6c7f60]"
                : "bg-white text-[#5a5a5a] border-[#ddd] hover:bg-[#6c7f60] hover:text-white"
            }`}
          >
            منتجات طلابنا
          </button>
          <button
            onClick={() => setFilter("platform")}
            className={`inline-block px-6 py-2 rounded-md border transition-colors ${
              filter === "platform"
                ? "bg-[#6c7f60] text-white border-[#6c7f60]"
                : "bg-white text-[#5a5a5a] border-[#ddd] hover:bg-[#6c7f60] hover:text-white"
            }`}
          >
            منتجات المنصة
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6c7f60]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              لا توجد منتجات متاحة لهذا الفلتر
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {/* زر عرض المزيد من المنتجات */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="bg-white border border-[#6c7f60] text-[#6c7f60] hover:bg-[#6c7f60] hover:text-white transition-colors duration-300 py-2 px-6 rounded-md font-medium"
            >
              عرض جميع المنتجات
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default HandmadeProductsSection;
