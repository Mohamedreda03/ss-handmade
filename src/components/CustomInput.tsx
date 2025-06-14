import { cn } from "@/lib/utils";
import { LucideIcon, Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/input";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Control } from "react-hook-form";
import { useState } from "react";

interface CustomInputProps {
  Icon: LucideIcon;
  placeholder: string;
  type?: string;
  className?: string;
  control: Control<any>;
  name: string;
  error?: string;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
}

export default function CustomInput({
  Icon,
  placeholder,
  type,
  className,
  control,
  name,
  error,
  disabled,
  dir = "rtl",
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type || "text";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative space-y-2">
          <FormControl>
            <div
              className={cn(
                "relative group transition-all duration-200",
                className
              )}
            >
              <div
                className={cn(
                  "flex items-center border-2 rounded-xl transition-all duration-200 bg-white shadow-sm hover:shadow-md focus-within:shadow-lg",
                  {
                    "border-red-500 bg-red-50": error,
                    "border-gray-200 hover:border-gray-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10":
                      !error,
                  }
                )}
                style={{ height: "56px" }}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-14 h-full rounded-r-xl transition-colors duration-200",
                    {
                      "bg-red-100": error,
                      "bg-gray-50 group-hover:bg-gray-100 group-focus-within:bg-primary/5":
                        !error,
                    }
                  )}
                >
                  <Icon
                    size={22}
                    className={cn("transition-colors duration-200", {
                      "text-red-500": error,
                      "text-gray-400 group-hover:text-gray-600 group-focus-within:text-primary":
                        !error,
                    })}
                  />
                </div>                <Input
                  {...field}
                  type={inputType}
                  className={cn(
                    "border-0 bg-transparent h-full px-4 text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0",
                    {
                      "text-right": dir === "rtl",
                      "text-left": dir === "ltr",
                      "pr-12": isPasswordField && dir === "rtl", // مساحة إضافية لزر العين في RTL
                      "pl-12": isPasswordField && dir === "ltr", // مساحة إضافية لزر العين في LTR
                    }
                  )}
                  placeholder={placeholder}
                  disabled={disabled}
                  dir={dir}
                  style={{
                    borderRadius:
                      dir === "rtl" ? "0 12px 12px 0" : "12px 0 0 12px",
                  }}
                />
                {isPasswordField && (
                  <button
                    type="button"
                    className={cn(
                      "absolute top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200",
                      {
                        "left-2": dir === "rtl",
                        "right-2": dir === "ltr",
                      }
                    )}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={disabled}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm font-medium flex items-center gap-1 mt-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {error === "Required" ? "هذا الحقل مطلوب" : error}
            </p>
          )}
        </FormItem>
      )}
    />
  );
}
