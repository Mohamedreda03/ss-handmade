"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Check,
  X,
  Star,
  Trash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SuccessStory {
  id: string;
  name: string;
  profession: string;
  story: string;
  achievement: string;
  course?: string;
  imageUrl?: string;
  status: string;
  isFeature: boolean;
  createdAt: string;
  user: {
    name?: string;
    email?: string;
    image?: string;
  };
}

interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}

export default function AdminSuccessStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchStories = async (page = 1, status = activeTab) => {
    try {
      setContentLoading(true);
      const statusParam =
        status !== "all" ? `&status=${status.toUpperCase()}` : "";
      const response = await axios.get(
        `/api/admin/success-stories?page=${page}&limit=5${statusParam}`
      );

      if (response.data && response.data.stories) {
        setStories(response.data.stories);
        setPagination(response.data.pagination);
      } else {
        // Handle legacy API response format
        setStories(response.data);
        setPagination(null);
      }
    } catch (error) {
      console.error("Error fetching success stories:", error);
      toast.error("حدث خطأ أثناء جلب قصص النجاح");
    } finally {
      setIsLoading(false);
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
        toast.error("ليس لديك صلاحية الوصول");
      } else {
        setCurrentPage(1); // Reset to page 1 when tab changes
        fetchStories(1, activeTab);
      }
    } else if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, session, router, activeTab]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.totalPages)) return;
    setCurrentPage(page);
    fetchStories(page, activeTab);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Page reset happens in the useEffect
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      await axios.patch("/api/admin/success-stories", {
        id,
        status: newStatus,
      });
      toast.success("تم تحديث حالة قصة النجاح بنجاح");
      fetchStories(currentPage, activeTab);
    } catch (error) {
      console.error("Error updating story status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة قصة النجاح");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeature = async (id: string, currentIsFeature: boolean) => {
    try {
      setActionLoading(id);
      await axios.patch("/api/admin/success-stories", {
        id,
        isFeature: !currentIsFeature,
      });
      toast.success(
        `تم ${!currentIsFeature ? "إضافة" : "إزالة"} القصة ${
          !currentIsFeature ? "إلى" : "من"
        } قصص النجاح المميزة`
      );
      fetchStories(currentPage, activeTab);
    } catch (error) {
      console.error("Error toggling feature status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة التمييز");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id);
      await axios.delete(`/api/admin/success-stories?id=${id}`);
      toast.success("تم حذف قصة النجاح بنجاح");
      fetchStories(currentPage, activeTab);
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("حدث خطأ أثناء حذف قصة النجاح");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">إدارة قصص النجاح</h1>

        <Tabs
          defaultValue="all"
          className="w-full md:w-auto"
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
            <TabsTrigger value="approved">معتمدة</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Section with Loading State */}
      <div className="relative min-h-[50vh]">
        {contentLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : null}

        {stories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium text-gray-600">
              لا توجد قصص نجاح {activeTab !== "all" ? "في هذه الحالة" : ""}
            </h2>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {stories.map((story) => (
                <Card key={story.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/4 lg:w-1/5">
                        <div className="relative h-48 md:h-full w-full rounded-md overflow-hidden">
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
                          />
                        </div>
                      </div>

                      <div className="w-full md:w-3/4 lg:w-4/5 rtl">
                        <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                          <div>
                            <h2 className="text-2xl font-bold">{story.name}</h2>
                            <p className="text-primary">{story.profession}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 items-start">
                            {story.status === "PENDING" && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                قيد المراجعة
                              </Badge>
                            )}
                            {story.status === "APPROVED" && (
                              <Badge className="bg-green-100 text-green-800">
                                معتمدة
                              </Badge>
                            )}
                            {story.status === "REJECTED" && (
                              <Badge className="bg-red-100 text-red-800">
                                مرفوضة
                              </Badge>
                            )}
                            {story.isFeature && (
                              <Badge className="bg-purple-100 text-purple-800">
                                مميزة
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <Badge variant="outline" className="mb-2">
                            {story.achievement}
                          </Badge>
                          {story.course && (
                            <Badge variant="outline" className="mr-2 mb-2">
                              {story.course}
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 mb-6">{story.story}</p>

                        <div className="flex items-center text-sm text-gray-500 mb-6">
                          <div className="flex items-center mr-4">
                            <span>الكاتب:</span>
                            <span className="font-medium mr-1">
                              {story.user.name || story.user.email || "مستخدم"}
                            </span>
                          </div>
                          <div>
                            <span>تاريخ الإضافة:</span>
                            <span className="font-medium mr-1">
                              {new Date(story.createdAt).toLocaleDateString(
                                "ar-EG"
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          {story.status === "PENDING" && (
                            <>
                              <Button
                                onClick={() =>
                                  handleStatusChange(story.id, "APPROVED")
                                }
                                variant="outline"
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                disabled={actionLoading === story.id}
                              >
                                {actionLoading === story.id ? (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="ml-2 h-4 w-4" />
                                )}
                                موافقة
                              </Button>

                              <Button
                                onClick={() =>
                                  handleStatusChange(story.id, "REJECTED")
                                }
                                variant="outline"
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                disabled={actionLoading === story.id}
                              >
                                {actionLoading === story.id ? (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="ml-2 h-4 w-4" />
                                )}
                                رفض
                              </Button>
                            </>
                          )}

                          {story.status === "REJECTED" && (
                            <Button
                              onClick={() =>
                                handleStatusChange(story.id, "APPROVED")
                              }
                              variant="outline"
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              disabled={actionLoading === story.id}
                            >
                              {actionLoading === story.id ? (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="ml-2 h-4 w-4" />
                              )}
                              موافقة
                            </Button>
                          )}

                          <Button
                            onClick={() =>
                              toggleFeature(story.id, story.isFeature)
                            }
                            variant="outline"
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                            disabled={actionLoading === story.id}
                          >
                            {actionLoading === story.id ? (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Star
                                className={`ml-2 h-4 w-4 ${
                                  story.isFeature ? "fill-purple-500" : ""
                                }`}
                              />
                            )}
                            {story.isFeature ? "إلغاء التمييز" : "تمييز"}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              >
                                <Trash className="ml-2 h-4 w-4" />
                                حذف
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  تأكيد حذف قصة النجاح
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من رغبتك في حذف قصة النجاح هذه؟
                                  لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(story.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {actionLoading === story.id ? (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    "تأكيد الحذف"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12 rtl">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || contentLoading}
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
                      disabled={contentLoading}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={
                      currentPage === pagination.totalPages || contentLoading
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
