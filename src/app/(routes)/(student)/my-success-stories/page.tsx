"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
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

interface SuccessStory {
  id: string;
  name: string;
  profession: string;
  story: string;
  achievement: string;
  course?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
}

export default function MySuccessStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "تمت الموافقة",
          color: "bg-green-100 text-green-800",
          description: "تمت الموافقة على قصتك وهي معروضة الآن للجميع",
        };
      case "REJECTED":
        return {
          label: "مرفوضة",
          color: "bg-red-100 text-red-800",
          description: "تم رفض القصة، يمكنك تعديلها وإعادة تقديمها",
        };
      default:
        return {
          label: "قيد المراجعة",
          color: "bg-yellow-100 text-yellow-800",
          description:
            "قصتك قيد المراجعة من قبل المشرفين وستظهر بعد الموافقة عليها",
        };
    }
  };

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/user/success-stories");
      setStories(response.data);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب قصص النجاح الخاصة بك");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/user/success-stories?id=${id}`);
      toast.success("تم حذف قصة النجاح بنجاح");
      fetchStories();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف قصة النجاح");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchStories();
    } else if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex justify-between items-center mb-10"
      >
        <h1 className="text-3xl font-bold">قصص النجاح الخاصة بي</h1>
        <Link href="/add-success-story">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة قصة نجاح
          </Button>
        </Link>
      </motion.div>

      {stories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-medium text-gray-600 mb-4">
            لا توجد قصص نجاح حتى الآن
          </h2>
          <p className="text-gray-500 mb-6">
            شارك قصة نجاحك وكيف ساعدتك منصتنا في تحقيق أهدافك!
          </p>
          <Link href="/add-success-story">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة قصة نجاح
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => {
            const status = getStatusLabel(story.status);
            return (
              <Card key={story.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {story.imageUrl && (
                      <div className="w-full md:w-1/4">
                        <div className="relative h-40 w-full rounded-md overflow-hidden">
                          <Image
                            src={
                              story.imageUrl.startsWith("/uploads")
                                ? story.imageUrl
                                : story.imageUrl
                            }
                            alt={story.name}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      </div>
                    )}
                    <div
                      className={`w-full ${story.imageUrl ? "md:w-3/4" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{story.name}</h3>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      {story.status !== "APPROVED" && (
                        <p className="text-sm text-gray-500 mb-3">
                          {status.description}
                        </p>
                      )}
                      <p className="text-primary font-medium mb-2">
                        {story.profession}
                      </p>
                      <p className="text-gray-600 mb-4">{story.achievement}</p>
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {story.story}
                      </p>

                      {story.course && (
                        <Badge variant="outline" className="mb-4">
                          {story.course}
                        </Badge>
                      )}

                      <div className="flex justify-end gap-2 mt-4">
                        <Link href={`/edit-success-story/${story.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                هل أنت متأكد من الحذف؟
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(story.id)}
                                disabled={deletingId === story.id}
                              >
                                {deletingId === story.id ? (
                                  <>
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    جار الحذف...
                                  </>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
