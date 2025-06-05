"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, Role } from "@prisma/client";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaCartShopping } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProductWithCreator extends Product {
  User?: {
    id: string;
    name?: string | null;
    role: Role;
  } | null;
}

interface ProductCardProps {
  product: ProductWithCreator;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const { data: session } = useSession();
  const router = useRouter();

  const handleAddToCart = () => {
    // التحقق من تسجيل الدخول
    if (!session) {
      toast.error("يجب تسجيل الدخول", {
        description: (
          <div className="flex flex-col gap-2">
            <span>يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى السلة</span>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/sign-in")}
                className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => router.push("/sign-up")}
                className="px-3 py-1 border border-primary text-primary rounded text-sm hover:bg-primary/10"
              >
                إنشاء حساب
              </button>
            </div>
          </div>
        ),
      });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
    });

    toast.success("تمت الإضافة للسلة", {
      description: (
        <div className="flex flex-col gap-2">
          <span>تمت إضافة {product.name} إلى سلة التسوق</span>
          <div className="flex gap-2">
            <button
              onClick={() => (window.location.href = "/cart")}
              className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
            >
              عرض السلة
            </button>
            <button
              onClick={() => (window.location.href = "/products")}
              className="px-3 py-1 border border-primary text-primary rounded text-sm hover:bg-primary/10"
            >
              إكمال التسوق
            </button>
          </div>
        </div>
      ),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-[12px] overflow-hidden shadow-sm group relative p-8 hover:shadow-md transition-shadow"
    >
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="relative h-[220px] w-full overflow-hidden mb-6">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded-[6px] group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500">
              صورة غير متوفرة
            </div>
          )}
        </div>
      </Link>
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h3
            className="text-2xl font-medium mb-1 line-clamp-1 overflow-hidden"
            dir="rtl"
          >
            {product.name}
          </h3>

          <div className="text-[#888C69] text-2xl font-medium">
            {product.price} جنيه
          </div>
        </div>
        {product.User ? (
          product.User.role === Role.STUDENT ? (
            <Image
              src="/images/student.svg"
              alt={product.User?.name || ""}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <Image
              src="/images/platform.svg"
              alt={product.User?.name || ""}
              width={80}
              height={80}
              className="rounded-full"
            />
          )
        ) : (
          <Image
            src="/images/platform.svg"
            alt="منصة"
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
      </div>
      <motion.div whileTap={{ scale: 0.95 }} className="mt-2">
        <Button
          onClick={handleAddToCart}
          className="bg-primary text-white hover:opacity-90 transition-colors w-full h-12 text-lg gap-2"
          size="lg"
        >
          <span>أضف إلى السلة</span>
          <FaCartShopping className="size-6 text-white" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ProductCard;
