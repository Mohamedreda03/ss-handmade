"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { admin_menu_data } from "./menu_data";
import Image from "next/image";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  
  // دالة للتحقق من تفعيل الرابط
  const isLinkActive = (linkPath: string) => {
    // مطابقة تامة للمسار
    if (pathname === linkPath) return true;
    
    // للمسارات الفرعية
    if (pathname.startsWith(linkPath + "/")) {
      // استثناء خاص لتجنب تفعيل /admin/products عند زيارة /admin/products-approval
      if (linkPath === "/admin/products" && pathname.startsWith("/admin/products-")) {
        return false;
      }
      return true;
    }
    
    return false;
  };
  
  return (
    <div className="lg:block shadow fixed right-0 inset-y-0 w-60 border-l hidden">
      <div>
        <div className="flex items-center justify-center h-[150px] bg-primary">
          <Image src="/logo.png" alt="Handmade Logo" width={120} height={80} />
        </div>
        <div className="flex flex-col mt-4">
          {admin_menu_data.map((link) => (
            <Link
              key={link.id}
              href={link.link}              className={cn(
                "px-4 py-3 flex items-center gap-3 dark:hover:bg-primary/10 hover:bg-primary/5",
                {
                  "border-l-4 border-primary bg-primary/10 hover:bg-primary/10":
                    isLinkActive(link.link),
                  hidden: link.role?.includes(role) === false,
                }
              )}
            >
              <link.Icon size={20} className="text-primary" />
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
