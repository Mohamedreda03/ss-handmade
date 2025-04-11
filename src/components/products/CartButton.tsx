"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartItems } from "./cart-items";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
  const totalItems = useCartStore((state) => state.totalItems);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative cursor-pointer">
          <ShoppingCart className="h-7 w-7" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md z-[1001]">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <CartItems />
      </SheetContent>
    </Sheet>
  );
}
