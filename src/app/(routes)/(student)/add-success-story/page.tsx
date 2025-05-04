"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { SuccessStoryForm } from "@/components/forms/SuccessStoryForm";
import { Button } from "@/components/ui/button";

export default function AddSuccessStoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <Link href="/my-success-stories">
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى قصص النجاح الخاصة بي
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-right">
            إضافة قصة نجاح جديدة
          </h1>
          <p className="text-gray-600 mt-2 text-right">
            شارك تجربتك مع المنصة وكيف ساعدتك في تحقيق أهدافك
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <SuccessStoryForm />
        </motion.div>
      </div>
    </div>
  );
}
