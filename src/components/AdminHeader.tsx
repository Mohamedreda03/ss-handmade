import AuthMenu from "./AuthMenu";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import DashboardMobileMenu from "./DashboardMobileMenu";
import ThemeSwitcherAdmin from "./admin_dashboard/theme-switcher-admin";
import { auth } from "@/auth";

export default async function AdminHeader() {
  const session = await auth();

  return (
    <div className="lg:pr-60 h-16">
      <div className="w-full h-full border-b flex items-center px-7">
        <DashboardMobileMenu role={session?.user.role!} />
        <Button asChild variant="ghost" className="hidden md:flex">
          <Link
            href="/"
            className="flex items-center gap-2 hover:bg-secondary/15"
          >
            <LogOut size={20} className="text-primary" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </Button>
        <div className="mr-auto flex items-center gap-3">
          {/* <ThemeSwitcherAdmin /> */}
          <AuthMenu session={session} />
        </div>
      </div>
    </div>
  );
}
