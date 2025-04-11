"use client";

import {
  Book,
  LayoutDashboard,
  LogOut,
  QrCode,
  ShoppingBag,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { navigationMenu } from "./navbar/NavLinks";

const roles = ["ADMIN", "CONSTRUCTOR"];

export default function AuthMenu({ session }: { session: any }) {
  const avatar = session?.user.name.slice(0, 2).toLocaleUpperCase();

  const handleSignOut = async () => {
    await signOut({
      redirectTo: "/",
    });
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="p-0 rounded-full">
          <Avatar>
            <AvatarFallback>{avatar}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[1000]">
        <DropdownMenuLabel>حسابي</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {session && roles.includes(session?.user?.role) && (
          <DropdownMenuItem asChild>
            <Link
              href={
                session?.user?.role === "ADMIN"
                  ? "/admin/dashboard"
                  : "/admin/courses"
              }
            >
              <LayoutDashboard className="ml-2 h-4 w-4" />
              <span>لوحت التحكم</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuGroup>
          {navigationMenu.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <item.Icon className="ml-2 h-4 w-4" />
                <span className="ml-2">{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}

          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="ml-2 h-4 w-4" />
              <span>ملف المستخدم</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/student_courses">
              <Book className="ml-2 h-4 w-4" />
              <span>كورساتي</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/my-earnings">
              <ShoppingBag className="ml-2 h-4 w-4" />
              <span>ارباحي</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/my-products">
              <ShoppingBag className="ml-2 h-4 w-4" />
              <span>منتجاتي</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/coupons">
              <QrCode className="ml-2 h-4 w-4" />
              <span>كوبوناتي</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="ml-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
