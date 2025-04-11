"use client";

import { cn } from "@/lib/utils";
import { Brain, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navigationMenu = [
  { name: "الكورسات", href: "/course", Icon: Brain },
  { name: "المنتجات", href: "/products", Icon: Package },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="hidden md:flex items-center justify-center gap-4 mx-auto font-medium">
      {navigationMenu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-gray-700 hover:text-primary transition-colors duration-300 px-3 py-2 rounded-md hover:bg-gray-100",
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "bg-gray-100 text-primary"
              : ""
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
