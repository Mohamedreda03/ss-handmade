"use client";

import { useEffect, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SuccessPaymentPage() {
  const router = useRouter();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-green-500 py-6">
          <div className="flex justify-center">
            <div
              className={cn(
                "w-20 h-20 rounded-full bg-white flex items-center justify-center transition-all duration-500",
                animationComplete ? "scale-100" : "scale-0"
              )}
            >
              <Check className="text-green-500 h-10 w-10" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8 pb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">تم الدفع بنجاح!</h1>
          <p className="text-gray-600 mb-6">
            شكراً لك. لقد تم تأكيد عملية الدفع وتفعيل اشتراكك.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center pb-8">
          <Link href="/">
            <Button className="gap-2">
              <ArrowRight size={16} />
              <span>الانتقال إلى الصفحة الرئيسية</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
