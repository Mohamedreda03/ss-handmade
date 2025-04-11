"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";

interface CheckoutButtonProps {
  courseId: string;
  className?: string;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
}

export default function CheckoutButton({
  courseId,
  className,
  children,
  variant = "default",
}: CheckoutButtonProps) {
  const router = useRouter();

  const handleNavigateToCheckout = () => {
    router.push(`/checkout-course/${courseId}`);
  };

  return (
    <Button
      onClick={handleNavigateToCheckout}
      className={cn("rounded-full", className)}
      variant={variant}
    >
      {children || "اشترك الآن"}
    </Button>
  );
}
