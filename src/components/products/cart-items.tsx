"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SheetClose } from "../ui/sheet";

export const CartItems = () => {
  const router = useRouter();
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const handleCheckout = async () => {
    try {
      if (items.length > 0) {
        router.push("/checkout");
      }
    } catch (error) {
      console.error("Checkout failed", error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 -mx-6 px-6">
        <div className="space-y-4 pt-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 py-3 border-b">
              <div className="w-20 h-20 rounded-md relative bg-gray-100 flex-shrink-0">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <div className="text-sm text-muted-foreground mt-1">
                  EGP {item.price.toFixed(2)} × {item.quantity}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <MinusIcon className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <PlusIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-2"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 space-y-4 border-t mt-4 mb-6">
        <div className="flex justify-between">
          <span>Total ({totalItems} items)</span>
          <span className="font-semibold">EGP {totalPrice.toFixed(2)}</span>
        </div>

        <div className="flex gap-2">
          <SheetClose asChild>
            <Button variant="outline" onClick={clearCart} className="flex-1">
              Clear Cart
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button onClick={handleCheckout} className="flex-1">
              Checkout
            </Button>
          </SheetClose>
        </div>
      </div>
    </div>
  );
};
