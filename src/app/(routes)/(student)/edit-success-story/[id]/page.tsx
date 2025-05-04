"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";

import { SuccessStoryForm } from "@/components/forms/SuccessStoryForm";
import { Button } from "@/components/ui/button";

interface EditSuccessStoryPageProps {
  params: { id: string };
}

export default function EditSuccessStoryPage({
  params,
}: EditSuccessStoryPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [story, setStory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/user/success-stories");
      const userStories = response.data;
      const foundStory = userStories.find((s: any) => s.id === params.id);

      if (foundStory) {
        setStory(foundStory);
      } else {
        toast.error("لم يتم العثور على قصة النجاح");
        router.push("/my-success-stories");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب بيانات قصة النجاح");
      router.push("/my-success-stories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchStory();
    }
  }, [status, router, params.id]);

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <h1 className="text-3xl font-bold text-right">تعديل قصة النجاح</h1>
          <p className="text-gray-600 mt-2 text-right">
            قم بتحديث تفاصيل قصة نجاحك
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {story && <SuccessStoryForm initialData={story} />}
        </motion.div>
      </div>
    </div>
  );
}
