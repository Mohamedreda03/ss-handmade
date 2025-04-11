import Link from "next/link";
import React from "react";
import { admin_menu_data } from "./menu_data";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function SidebarMenu({
  role,
}: {
  role: "ADMIN" | "CONSTRUCTOR";
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col mt-4">
      {admin_menu_data.map((link) => (
        <Link
          key={link.id}
          href={link.link}
          className={cn(
            "px-4 py-3 flex items-center gap-3 dark:hover:bg-primary/10 hover:bg-primary/5",
            {
              "border-l-4 border-primary bg-primary/10 hover:bg-primary/10":
                pathname.includes(link.link),
              hidden: link.role?.includes(role),
            }
          )}
        >
          <link.Icon size={20} className="text-primary" />
          <span>{link.title}</span>
        </Link>
      ))}
    </div>
  );
}
