"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loading from "@/components/Loading";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Check,
  X,
  Pause,
  Download,
  ExternalLink,
  Calendar,
  User,
  Mail,
  Briefcase,
  Clock,
  Link as LinkIcon,
  Star,
  FileText,
  Award,
  Building,
  Play,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type ContractorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

interface ContractorProfile {
  id: string;
  bio: string | null;
  specialization: string | null;
  experience: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  cvUrl: string | null;
  status: ContractorStatus;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
  };
}

const statusLabels = {
  PENDING: "في انتظار المراجعة",
  APPROVED: "مقبول",
  REJECTED: "مرفوض",
  SUSPENDED: "معلق",
};

const statusVariants = {
  PENDING: "outline" as const,
  APPROVED: "success" as const,
  REJECTED: "destructive" as const,
  SUSPENDED: "secondary" as const,
};

const statusColors = {
  PENDING: "text-orange-600 bg-orange-50 border-orange-200",
  APPROVED: "text-green-600 bg-green-50 border-green-200",
  REJECTED: "text-red-600 bg-red-50 border-red-200",
  SUSPENDED: "text-gray-600 bg-gray-50 border-gray-200",
};

export default function ContractorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractorId = params.contractorId as string;
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<
    "APPROVED" | "REJECTED" | "SUSPENDED" | null
  >(null);

  const queryClient = useQueryClient();
  // Fetch contractor details
  const {
    data: contractor,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contractor", contractorId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/admin/contractors/${contractorId}`
      );
      return response.data.data;
    },
    enabled: !!contractorId,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: false, // Only refetch when tab is active
  });
  // Update contractor status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: ContractorStatus }) => {
      const response = await axios.patch(
        `/api/admin/contractors/${contractorId}`,
        {
          status,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update the current contractor data immediately
      queryClient.setQueryData(["contractor", contractorId], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            status: reviewAction,
            reviewedAt: new Date().toISOString(),
          };
        }
        return oldData;
      });

      // Invalidate and refetch queries
      queryClient.invalidateQueries(["contractor", contractorId]);
      queryClient.invalidateQueries(["contractors"]);

      toast({
        title: "تم التحديث بنجاح",
        description: data.message,
      });
      setIsReviewDialogOpen(false);
      setReviewAction(null);
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "فشل في تحديث الحالة",
        variant: "destructive",
      });
    },
  });

  const handleReviewAction = (
    action: "APPROVED" | "REJECTED" | "SUSPENDED"
  ) => {
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };
  const handleConfirmReview = () => {
    if (!reviewAction) return;

    updateStatusMutation.mutate({
      status: reviewAction,
    });
  };

  const handleDownloadCV = () => {
    if (!contractor?.cvUrl) return;

    const link = document.createElement("a");
    link.href = contractor.cvUrl;
    link.download = `CV_${contractor.user.name || "contractor"}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return <Loading className="h-[400px]" />;
  }

  if (error || !contractor) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
          <CardContent className="text-center p-8">
            <X className="mx-auto h-16 w-16 text-red-500 mb-4" />{" "}
            <h2 className="text-xl font-semibold text-[#3D402C] mb-2">
              لم يتم العثور على المُنسق
            </h2>
            <p className="text-[#3D402C]/70 mb-4">
              المُنسق المطلوب غير موجود أو تم حذفه
            </p>
            <Button
              onClick={() => router.push("/admin/contractors")}
              variant="outline"
              className="border-[#6F7354] text-[#6F7354] hover:bg-[#6F7354] hover:text-white"
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للقائمة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F0] p-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {" "}
        <div>
          <h1 className="text-3xl font-bold text-[#6F7354]">تفاصيل المُنسق</h1>
          <p className="text-[#3D402C]/70 mt-1">
            عرض تفاصيل طلب التسجيل ومراجعته
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/contractors")}
          variant="outline"
          className="border-[#6F7354] text-[#6F7354] hover:bg-[#6F7354] hover:text-white"
        >
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة للقائمة
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#6F7354]/10 to-[#F0E0D9]/20 border-b border-[#F0E0D9]">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-[#6F7354]/20">
                  <AvatarImage
                    src={contractor.user.image || undefined}
                    alt={contractor.user.name || "مُنسق"}
                  />
                  <AvatarFallback className="bg-[#6F7354] text-white text-lg">
                    {contractor.user.name?.charAt(0)?.toUpperCase() || "م"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {" "}
                  <CardTitle className="text-2xl text-[#3D402C] flex items-center gap-3">
                    {contractor.user.name || "غير محدد"}
                    <Badge
                      className={`${
                        statusColors[contractor.status as ContractorStatus]
                      } font-medium px-3 py-1`}
                    >
                      {statusLabels[contractor.status as ContractorStatus]}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-[#3D402C]/70 text-base mt-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {contractor.user.email || "غير محدد"}
                    </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#6F7354]">
                    <Briefcase className="h-5 w-5" />
                    <span className="font-semibold">التخصص</span>
                  </div>
                  <p className="text-[#3D402C] bg-[#F0E0D9]/30 p-3 rounded-lg">
                    {contractor.specialization || "لم يتم تحديد التخصص"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#6F7354]">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">سنوات الخبرة</span>
                  </div>
                  <p className="text-[#3D402C] bg-[#F0E0D9]/30 p-3 rounded-lg">
                    {contractor.experience || "لم يتم تحديد سنوات الخبرة"}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#F0E0D9]" />

              {/* Bio */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#6F7354]">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold">نبذة شخصية</span>
                </div>
                <div className="bg-[#F0E0D9]/30 p-4 rounded-lg">
                  <p className="text-[#3D402C] leading-relaxed">
                    {contractor.bio || "لم يتم إضافة نبذة شخصية"}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#F0E0D9]" />

              {/* Links and CV */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[#6F7354] font-semibold">
                  <LinkIcon className="h-5 w-5" />
                  الروابط والمرفقات
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LinkedIn */}
                  <div className="flex items-center justify-between p-3 bg-[#F0E0D9]/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <span className="text-[#3D402C]">LinkedIn</span>
                    </div>
                    {contractor.linkedinUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openExternalLink(contractor.linkedinUrl!)
                        }
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <ExternalLink className="h-4 w-4 ml-1" />
                        فتح
                      </Button>
                    ) : (
                      <span className="text-[#3D402C]/50 text-sm">
                        غير متوفر
                      </span>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div className="flex items-center justify-between p-3 bg-[#F0E0D9]/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-purple-600" />
                      <span className="text-[#3D402C]">الموقع الشخصي</span>
                    </div>
                    {contractor.portfolioUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openExternalLink(contractor.portfolioUrl!)
                        }
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        <ExternalLink className="h-4 w-4 ml-1" />
                        فتح
                      </Button>
                    ) : (
                      <span className="text-[#3D402C]/50 text-sm">
                        غير متوفر
                      </span>
                    )}
                  </div>
                </div>

                {/* CV Download */}
                {contractor.cvUrl && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#6F7354]/10 to-[#F0E0D9]/20 rounded-lg border border-[#6F7354]/20">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-[#6F7354]" />
                      <div>
                        <p className="font-semibold text-[#3D402C]">
                          السيرة الذاتية
                        </p>
                        <p className="text-[#3D402C]/70 text-sm">ملف PDF</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadCV}
                      className="bg-[#6F7354] text-white hover:bg-[#5F6348]"
                    >
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Actions */}
          <Card className="bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
            <CardHeader className="bg-[#6F7354]/10">
              <CardTitle className="text-[#3D402C]">إجراءات المراجعة</CardTitle>
              <CardDescription className="text-[#3D402C]/70">
                قم بمراجعة الطلب واتخاذ الإجراء المناسب
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => handleReviewAction("APPROVED")}
                  disabled={
                    contractor.status === "APPROVED" ||
                    updateStatusMutation.isLoading
                  }
                  className="w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 ml-2" />
                  قبول الطلب
                </Button>
                <Button
                  onClick={() => handleReviewAction("REJECTED")}
                  disabled={
                    contractor.status === "REJECTED" ||
                    updateStatusMutation.isLoading
                  }
                  variant="destructive"
                  className="w-full"
                >
                  <X className="h-4 w-4 ml-2" />
                  رفض الطلب
                </Button>{" "}
                <Button
                  onClick={() => handleReviewAction("SUSPENDED")}
                  disabled={
                    contractor.status === "SUSPENDED" ||
                    updateStatusMutation.isLoading
                  }
                  className="w-full bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  <Pause className="h-4 w-4 ml-2" />
                  تعليق الحساب
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
            <CardHeader className="bg-[#6F7354]/10">
              <CardTitle className="text-[#3D402C]">معلومات الطلب</CardTitle>
            </CardHeader>{" "}
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#6F7354]" />
                <div>
                  <p className="text-sm text-[#3D402C]/70">تاريخ التسجيل</p>
                  <p className="font-medium text-[#3D402C]">
                    {format(new Date(contractor.createdAt), "dd MMMM yyyy", {
                      locale: ar,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#3D402C]">
              {" "}
              {reviewAction === "APPROVED" && "تأكيد قبول المُنسق"}
              {reviewAction === "REJECTED" && "تأكيد رفض المُنسق"}
              {reviewAction === "SUSPENDED" && "تأكيد تعليق المُنسق"}
            </DialogTitle>
            <DialogDescription className="text-[#3D402C]/70">
              {reviewAction === "APPROVED" &&
                "سيتم قبول المُنسق وتفعيل حسابه للوصول إلى المنصة"}
              {reviewAction === "REJECTED" &&
                "سيتم رفض طلب المُنسق ولن يتمكن من الوصول إلى المنصة"}
              {reviewAction === "SUSPENDED" &&
                "سيتم تعليق حساب المُنسق مؤقتاً ومنعه من الوصول"}
            </DialogDescription>{" "}
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
              className="border-[#6F7354] text-[#6F7354] hover:bg-[#6F7354] hover:text-white"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmReview}
              disabled={updateStatusMutation.isLoading}
              className={`
                ${
                  reviewAction === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
                ${
                  reviewAction === "REJECTED"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }                ${
                reviewAction === "SUSPENDED"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : ""
              }
                text-white
              `}
            >
              {updateStatusMutation.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التحديث...
                </div>
              ) : (
                <>
                  <Check className="h-4 w-4 ml-2" />
                  تأكيد القرار
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
