"use client";

import { useQuery } from "react-query";
import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import CourseCard from "@/components/CourseCard";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Search, Loader2, BookOpen, BookText } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// تعريف نوع البيانات للكورس
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

// تعريف نوع البيانات للاشتراك
interface Subscription {
  id: string;
  courseId: string;
}

export const dynamic = "force-dynamic";
export default function CoursePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const data = await axios
        .get("/api/courses/courses_sub")
        .then((res) => res.data);
      return data;
    },
  });

  useEffect(() => {
    if (data?.courses) {
      let filtered = [...data.courses] as Course[];

      // تطبيق البحث
      if (searchTerm) {
        filtered = filtered.filter(
          (course) =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.description &&
              course.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        );
      }

      // تطبيق الترتيب
      switch (sortBy) {
        case "newest":
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "oldest":
          filtered.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case "priceHigh":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "priceLow":
          filtered.sort((a, b) => a.price - b.price);
          break;
        default:
          break;
      }

      setFilteredCourses(filtered);
    }
  }, [data, searchTerm, sortBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* رأس الصفحة مع خلفية زخرفية */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 p-8 mb-10"
      >
        <div className="absolute inset-0 opacity-10 bg-pattern-dots"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                استكشف دورات الحرف اليدوية
              </h1>
              <p className="text-lg text-muted-foreground">
                اكتسب مهارات جديدة واصنع منتجاتك الخاصة مع دوراتنا التدريبية
              </p>
            </div>
            <div className="shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-full">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* قسم الفلاتر */}
      <div className="bg-card rounded-lg shadow p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">تصفية الدورات</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              placeholder="ابحث عن دورة..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 rtl:pr-10 rtl:pl-4"
              disabled={isLoading}
            />
            <div className="absolute left-3 rtl:right-3 rtl:left-auto top-2.5">
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          <Select
            value={sortBy}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="الترتيب حسب" />
              {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="oldest">الأقدم</SelectItem>
              <SelectItem value="priceHigh">السعر: الأعلى أولاً</SelectItem>
              <SelectItem value="priceLow">السعر: الأقل أولاً</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* عرض الكورسات */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">جاري تحميل الدورات...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-lg p-8 text-center"
          >
            <BookText className="h-20 w-20 text-muted mb-4" />
            <h3 className="text-2xl font-semibold mb-2">
              لا توجد دورات متطابقة
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "لم نتمكن من العثور على دورات مطابقة لبحثك. جرب كلمات مفتاحية مختلفة."
                : "لا توجد دورات متاحة حاليا."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const isOwned = data?.subscriptions?.find(
                (subscription: Subscription) =>
                  subscription.courseId === course.id
              );

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    isOwned={isOwned ? true : false}
                    isUserAuth={true}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
