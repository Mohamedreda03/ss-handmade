"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, Role } from "@prisma/client";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaCartShopping } from "react-icons/fa6";
import { motion } from "framer-motion";

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

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
    });

    toast.success("تمت الإضافة للسلة", {
      description: `تمت إضافة ${product.name} إلى سلة التسوق`,
      action: {
        label: "عرض السلة",
        onClick: () => (window.location.href = "/cart"),
      },
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
        <div>
          <h3 className="text-2xl font-medium text-right flex-grow ml-2">
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
