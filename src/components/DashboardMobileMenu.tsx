"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";
import { admin_menu_data } from "./menu_data";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardMobileMenu({ role }: { role: string }) {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="outline" className="border-0 p-0 hover:bg-transparent">
          <Menu size={27} />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0">
        <div className="flex flex-col w-full h-[400px] justify-center">
          {admin_menu_data.map((link) => (
            <SheetClose asChild key={link.id}>
              <Link
                href={link.link}
                className={cn("py-2 flex items-center justify-center text-xl", {
                  "border-l-4 border-secondary bg-secondary/20 hover:bg-secondary/20":
                    pathname.includes(link.link),
                  hidden: link.role?.includes(role) === false,
                })}
              >
                {link.title}
              </Link>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
