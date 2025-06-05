"use client";

import { useCartClearOnSignOut } from "@/hooks/useCartClearOnSignOut";

/**
 * مكون لإدارة حالة السلة - يقوم بمسح السلة تلقائياً عند تسجيل الخروج
 */
export function CartManager() {
  useCartClearOnSignOut();
  return null;
}
