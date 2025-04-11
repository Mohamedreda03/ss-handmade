"use client";

import { usePathname } from "next/navigation";
import { menu_data } from "../menu_data";

export default function DashboardHead() {
  const pathname = usePathname();

  const currentPage = menu_data.find((item) => item.link === pathname);
  const Icon: any = currentPage?.Icon;
  return (
    <div className="flex items-center justify-center w-full mb-5">
      <div className="border flex items-center rounded-full text-xl pl-5 shadow-md">
        <Icon className="w-16 h-11 dark:bg-secondary/65 bg-secondary text-white py-2 px-2 ml-3 rounded-full" />
        <span>{currentPage?.title}</span>
      </div>
    </div>
  );
}
0;
