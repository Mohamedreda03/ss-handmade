"use client";

import { getServerSession } from "@/actions/getServerSession";
import { isAuth } from "@/actions/isAuth";
import { signout } from "@/actions/signout";
import { toast } from "@/hooks/use-toast";
import { BadgeInfo } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function AuthChecker({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const clearCart = useCartStore((state) => state.clearCart);

  const checkAuth = useCallback(async () => {
    const isUserAuth = await isAuth();
    const session = await getServerSession();

    if (session && !isUserAuth) {
      // مسح السلة قبل تسجيل الخروج
      clearCart();

      await signout();
      toast({
        variant: "destructive",
        description: (
          <div className="flex items-center gap-3">
            <BadgeInfo size={18} className="mr-2 text-red-500" />
            <span>هناك جهاز آخر قام بتسجيل الدخول</span>
          </div>
        ),
      });
      router.refresh();
    }
  }, [router, clearCart]);

  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  return <>{children}</>;
}
