"use client";

import { useSession } from "next-auth/react";
import { useQueryClient } from "react-query";
import { useEffect, useRef } from "react";

export function useSessionCache() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // عند تحميل الجلسة لأول مرة
    if (status === "loading") return;

    const currentUserId = session?.user?.id || null;
    const previousUserId = previousUserIdRef.current;

    // إذا تغير معرف المستخدم (تسجيل دخول جديد أو تسجيل خروج)
    if (previousUserId !== currentUserId) {
      // مسح الاستعلامات المرتبطة بالمستخدم السابق
      if (previousUserId) {
        queryClient.removeQueries(["courses", previousUserId]);
        queryClient.removeQueries(["subscriptions", previousUserId]);
        queryClient.removeQueries(["orders", previousUserId]);
        queryClient.removeQueries(["products", previousUserId]);
      }

      // تحديث المرجع
      previousUserIdRef.current = currentUserId;

      // إذا تم تسجيل الخروج، مسح جميع الاستعلامات المرتبطة بالمستخدم
      if (!currentUserId && previousUserId) {
        queryClient.clear(); // مسح جميع الاستعلامات
      }
    }
  }, [session?.user?.id, status, queryClient]);

  return { session, status };
}
