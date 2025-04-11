"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcherAdmin({
  className,
}: {
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={cn("mt-2", className)}>
      {theme === "dark" ? (
        <button onClick={() => setTheme("light")}>
          <Sun className="h-9 w-9 text-yellow-400" />
        </button>
      ) : (
        <button onClick={() => setTheme("dark")}>
          <Moon className="h-9 w-9 text-yellow-400" />
        </button>
      )}
    </div>
  );
}
