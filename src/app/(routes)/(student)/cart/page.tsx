"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Trash2Icon, MinusIcon, PlusIcon, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  // Wait for hydration to complete before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">سلة التسوق</h1>
        {items.length > 0 && (
          <Button variant="outline" onClick={clearCart} size="sm">
            <Trash2Icon className="ml-2 h-4 w-4" />
            مسح السلة
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="flex justify-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-medium">السلة فارغة</h2>
          <p className="text-muted-foreground">
            لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">تصفح المنتجات</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4">
                  المنتجات ({totalItems})
                </h2>
                <div className="divide-y">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="py-4 flex gap-4"
                      >
                        <div className="w-24 h-24 bg-muted rounded-md relative flex-shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover rounded-md"
                              sizes="(max-width: 768px) 100vw, 768px"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                              لا توجد صورة
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-lg font-medium hover:underline"
                          >
                            {item.name}
                          </Link>

                          <div className="text-lg font-semibold mt-1 text-primary">
                            {item.price.toFixed(2)} جنيه مصري
                          </div>

                          <div className="flex items-center gap-1 mt-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              aria-label="تقليل الكمية"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </Button>

                            <div className="w-10 text-center font-medium">
                              {item.quantity}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              aria-label="زيادة الكمية"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.productId)}
                            aria-label="إزالة المنتج"
                          >
                            <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow overflow-hidden sticky top-20">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4">ملخص الطلب</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عدد المنتجات</span>
                    <span>{totalItems}</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">المجموع</span>
                    <span>{totalPrice.toFixed(2)} جنيه مصري</span>
                  </div>

                  <div className="pt-4 border-t mt-4">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => router.push("/checkout")}
                    >
                      متابعة الدفع
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      size="lg"
                      asChild
                    >
                      <Link href="/products">متابعة التسوق</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
