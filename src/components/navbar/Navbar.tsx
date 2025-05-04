"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { FaCartShopping } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { FaUser } from "react-icons/fa";
import { useCartStore } from "@/store/useCartStore";
import AuthMenu from "../AuthMenu";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // استخدام Zustand للحصول على عدد العناصر في سلة التسوق
  const totalItems = useCartStore((state) => state.totalItems);

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "من نحن", href: "/about" },
    { name: "المنتجات", href: "/products" },
    { name: "قصص النجاح", href: "/success-stories" },
    { name: "الدورات", href: "/course" },
    { name: "الرئيسية", href: "/" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-primary text-white shadow-sm w-full">
      <div className="container mx-auto">
        <nav className="flex items-center justify-between flex-row h-[80px] px-4">
          {/* User and Cart Icons (Left side) */}
          <div className="flex items-center gap-6">
            <AuthMenu session={session} />
            <Link
              href="/cart"
              className="relative p-2 hover:bg-primary-darker rounded-full"
            >
              <FaCartShopping className="h-6 w-6 text-white" />
              {/* إظهار عدد العناصر فقط إذا كان أكبر من صفر */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary border border-primary text-xs rounded-full size-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="p-2 hover:bg-primary-darker rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>

          {/* Navigation Links (Center) - Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <ul className="flex gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-white hover:text-secondary-lighter transition-colors duration-300 py-2 border-b-2 border-transparent",
                      (pathname === link.href ||
                        pathname.startsWith(`${link.href}/`)) &&
                        "border-b-2 border-white font-medium"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo (Right side) */}
          <div>
            <Link href="/" className="flex items-center">
              <h1 className="text-3xl font-bold">
                Hand <span className="font-light">Made</span>
              </h1>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-darker py-4 px-4 animate-in fade-in duration-300">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-white hover:text-secondary-lighter transition-colors duration-300 py-2 block",
                    pathname === link.href &&
                      "font-medium text-secondary-lighter"
                  )}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
