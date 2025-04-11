import React from "react";
import { Button } from "./ui/button";
import { LoaderCircle } from "lucide-react";

interface ButtonLoadProps {
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
  title?: string;
  loadingTitle?: string;
  type?: "button" | "submit";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export default function ActionButton({
  onClick,
  isLoading,
  className,
  variant,
  loadingTitle,
  title,
  type,
}: ButtonLoadProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={className}
      variant={variant || "default"}
      type={type || "button"}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span>{loadingTitle || "جاري الحفظ"}</span>{" "}
          <LoaderCircle size={20} className="animate-spin" />
        </span>
      ) : (
        <span>{title || "حفظ التعديل"}</span>
      )}
    </Button>
  );
}
