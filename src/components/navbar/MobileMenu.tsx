"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

import "./nav.css";
import Link from "next/link";
import ThemeSwitcher from "../theme-switcher";
import { LogIn, Menu, User2, X } from "lucide-react";
import { navigationMenu } from "./NavLinks";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef: any = useRef(null);
  const menuBtn: any = useRef(null);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: any) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      menuBtn.current &&
      !menuBtn.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex items-center">
      {/* <ThemeSwitcher className="md:hidden" /> */}
      <button
        ref={menuBtn}
        className="flex items-center justify-center w-10 h-10 p-2 rounded-md md:hidden"
        onClick={handleClick}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <nav
        ref={menuRef}
        className={cn(
          "absolute top-[80px] w-full left-0 right-0 md:hidden bg-slate-500 text-white rounded-lg shadow-lg z-50 transition-all duration-300",
          isOpen ? "block" : "hidden"
        )}
      >
        <ul className="flex flex-col gap-3 p-4">
          <li className="w-full">
            <Link
              onClick={handleClick}
              href="/sign-up"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-base hover:bg-primary-foreground/10 w-full"
            >
              <User2 size={20} className="text-white" />
              انشئ حساب الان!
            </Link>
          </li>
          <li className="w-full">
            <Link
              onClick={handleClick}
              href="/sign-in"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-base hover:bg-primary-foreground/10 w-full"
            >
              <LogIn size={20} className="text-white" />
              سجل الدخول الي حسابك
            </Link>
          </li>
          {navigationMenu.map((item) => (
            <li className="w-full" key={item.href}>
              <Link
                onClick={handleClick}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-base hover:bg-primary-foreground/10 w-full"
              >
                <item.Icon size={20} className="text-white" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
