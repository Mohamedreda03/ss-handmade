"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menu_data } from "../menu_data";

export default function DashboardMenu() {
  const pathname = usePathname();
  return (
    <div className="md:flex-[0.4] md:border-l border-secondary/25 p-3 w-full min-w-[250px]">
      <div className="flex flex-col gap-2 h-full w-full">
        {menu_data.map((item) => (
          <Link href={item.link} key={item.id}>
            <div
              className={`flex items-center text-lg gap-2 p-2 rounded-lg ${
                pathname === item.link
                  ? "bg-secondary/25 border border-secondary"
                  : "border"
              }`}
            >
              <item.Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
