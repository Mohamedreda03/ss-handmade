"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import TestimonialCTA from "@/components/TestimonialCTA";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./success-stories.css";

// قصص احتياطية في حالة عدم وجود قصص معتمدة
const fallbackStories = [
  {
    id: 1,
    name: "أحمد السعيد",
    profession: "مهندس برمجيات",
    image: "/images/success/ahmed.jpg",
    story:
      "كنت أعمل في وظيفة لا تناسب طموحاتي، وبدأت رحلة التعلم مع منصتنا التعليمية. خلال ستة أشهر فقط، تعلمت مهارات البرمجة التي غيرت حياتي تماماً. اليوم، أعمل كمهندس برمجيات في شركة عالمية وزاد دخلي ثلاثة أضعاف. أشكر المنصة على جودة المحتوى والدعم المستمر الذي تلقيته طوال رحلتي.",
    achievement: "زيادة الدخل 300%",
    course: "دورة تطوير الويب الشاملة",
  },
  {
    id: 2,
    name: "سارة المهدي",
    profession: "رائدة أعمال",
    image: "/images/success/sara.jpg",
    story:
      "بدأت من الصفر دون أي خبرة في إدارة المشاريع، لكن شغفي بريادة الأعمال دفعني للالتحاق بدورات المنصة. استطعت بفضل الدورات المتخصصة وورش العمل تأسيس مشروعي الخاص الذي يحقق الآن إيرادات شهرية تتجاوز توقعاتي. المنصة لم تقدم لي المعرفة فقط، بل بناء شبكة علاقات مهنية مع أساتذة وخريجين ساهموا في نجاح مشروعي.",
    achievement: "تأسيس مشروع ناجح",
    course: "دبلومة ريادة الأعمال المتكاملة",
  },
  {
    id: 3,
    name: "خالد الرشيدي",
    profession: "محلل بيانات",
    image: "/images/success/khaled.jpg",
    story:
      "كنت أعمل محاسباً لمدة عشر سنوات، وأردت الانتقال لمجال تحليل البيانات لكن لم أعرف من أين أبدأ. اكتشفت منصتكم التعليمية وبدأت بدورة الأساسيات، ثم تقدمت تدريجياً. بعد عام واحد فقط، استطعت الحصول على وظيفة محلل بيانات في شركة مرموقة، وأصبحت الآن خبيراً في مجالي الجديد. التعليم المنظم والمشاريع العملية كانت العامل الرئيسي في نجاحي.",
    achievement: "تغيير المسار المهني بنجاح",
    course: "احتراف تحليل البيانات وعلوم البيانات",
  },
];

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.7,
    },
  }),
};

interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}

interface SuccessStory {
  id: string;
  name: string;
  profession: string;
  story: string;
  achievement: string;
  course?: string;
  imageUrl?: string;
  user: {
    name?: string;
    image?: string;
  };
}

export default function SuccessStoriesPage() {
  const { data: session } = useSession();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchStories = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/success-stories?page=${page}&limit=6`
      );

      if (
        response.data &&
        response.data.stories &&
        response.data.stories.length > 0
      ) {
        setStories(response.data.stories);
        setPagination(response.data.pagination);
      } else {
        setStories(fallbackStories as unknown as SuccessStory[]);
        setPagination(null);
      }
    } catch (error) {
      console.error("Error fetching success stories:", error);
      setStories(fallbackStories as unknown as SuccessStory[]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.totalPages)) return;
    setCurrentPage(page);
    // عند تغيير الصفحة، نعود إلى أعلى الصفحة
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-16"
      >
        <div className="text-center md:text-right mb-6 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient">قصص النجاح</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            نفخر بعرض قصص طلابنا الملهمة الذين تمكنوا من تحقيق أحلامهم من خلال
            رحلة التعلم معنا
          </p>
        </div>

        {session && (
          <div className="flex justify-center md:justify-start">
            <Link href="/my-success-stories">
              <Button size="lg" className="group">
                <Plus className="ml-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                مشاركة قصة نجاحي
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 rtl">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={variants}
                whileHover={{ scale: 1.03 }}
                className="h-full"
              >
                <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 success-card">
                  <Link href={`/success-stories/${story.id}`}>
                    <div className="relative h-64 w-full shimmer-effect">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                      <Image
                        src={
                          story.imageUrl?.startsWith("/uploads")
                            ? story.imageUrl
                            : story.imageUrl ||
                              `/images/success/default-user.jpg`
                        }
                        alt={story.name}
                        layout="fill"
                        objectFit="cover"
                        className="z-0"
                      />
                      <div className="absolute bottom-4 right-4 z-20">
                        <Badge className="bg-primary text-white px-3 py-1">
                          {story.achievement}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  <CardContent className="pt-6 pb-8 px-6">
                    <h3 className="text-2xl font-bold mb-1">{story.name}</h3>
                    <p className="text-primary font-medium mb-4">
                      {story.profession}
                    </p>
                    <p className="text-gray-600 mb-6 text-right leading-relaxed">
                      {story.story.length > 250
                        ? `${story.story.substring(0, 250)}...`
                        : story.story}
                    </p>
                    <div className="mt-auto flex justify-between items-center mt-4">
                      <Link href={`/success-stories/${story.id}`}>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                        >
                          قراءة المزيد
                        </Button>
                      </Link>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full overflow-hidden relative">
                          <Image
                            src={
                              story.user?.image ||
                              "/images/success/default-user.jpg"
                            }
                            alt={story.user?.name || "User"}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {story.user?.name || "مستخدم"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* التصفح الصفحي */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12 rtl">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`w-10 h-10 ${
                      currentPage === page ? "bg-primary text-white" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TestimonialCTA
        quote="التعليم هو أفضل استثمار للمستقبل، منصتكم التعليمية غيرت مستقبلي بالكامل ومنحتني الفرصة لاكتشاف إمكانياتي الحقيقية."
        author={session?.user?.name || ""}
        authorTitle={session?.user?.name ? "طالب متميز" : ""}
        ctaText="ابدأ رحلتك التعليمية الآن"
        ctaLink="/courses"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="mt-20 bg-primary/5 rounded-xl p-8 text-center shimmer-effect success-card"
      >
        <h2 className="text-2xl font-bold mb-4">
          انضم إلينا وكن قصة نجاح قادمة
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          ابدأ رحلتك التعليمية اليوم واكتسب المهارات التي ستمكنك من تحقيق أهدافك
          وتغيير مسارك المهني
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/courses">
            <Button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              تصفح الدورات التعليمية
            </Button>
          </Link>
          {!session && (
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="px-8 py-3 rounded-lg font-medium"
              >
                تسجيل الدخول
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
