import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Input } from "./ui/input";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Control } from "react-hook-form";

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
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative">
          <FormControl>
            <div
              className={cn(
                "border  dark:border-first rounded h-12 flex",
                className,
                {
                  "border-red-500": error,
                }
              )}
            >
              <div className="w-12 h-full flex items-center justify-center dark:bg-first/20">
                <Icon size={20} className="text-primary/70 bg-transparent" />
              </div>
              <Input
                {...field}
                type={type ? type : "text"}
                className={cn("shad-input", {
                  "placeholder:text-end ml-4": dir === "ltr",
                })}
                placeholder={placeholder}
                disabled={disabled}
                dir={dir}
              />
            </div>
          </FormControl>
          {/* <FormMessage /> */}
          {error && (
            <p className="absolute text-red-400 -bottom-5 text-sm">
              {error === "Required" ? "هذا الحقل مطلوب" : error}
            </p>
          )}
        </FormItem>
      )}
    />
  );
}
