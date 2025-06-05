"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";

/**
 * Hook لمسح السلة تلقائياً عند تسجيل الخروج أو انتهاء الجلسة
 */
export function useCartClearOnSignOut() {
  const { status } = useSession();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // مسح السلة عند عدم وجود جلسة نشطة
    if (status === "unauthenticated") {
      clearCart();
    }
  }, [status, clearCart]);
}
