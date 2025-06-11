"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/Loading";
import Pagenation from "@/components/Pagenation";
import { toast } from "@/hooks/use-toast";
import {
  Eye,
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
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

export default function ContractorsManagementPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContractor, setSelectedContractor] =
    useState<ContractorProfile | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<
    "APPROVED" | "REJECTED" | "SUSPENDED" | null
  >(null);

  const queryClient = useQueryClient();
  // Fetch contractors data
  const { data, isLoading, error } = useQuery({
    queryKey: ["contractors", statusFilter, currentPage],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/contractors`, {
        params: {
          status: statusFilter,
          page: currentPage,
          limit: 10,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: false, // Only refetch when tab is active
  });
  // Update contractor status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      contractorId,
      status,
    }: {
      contractorId: string;
      status: ContractorStatus;
    }) => {
      const response = await axios.patch(
        `/api/admin/contractors/${contractorId}`,
        {
          status,
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the contractors list immediately
      queryClient.setQueryData(
        ["contractors", statusFilter, currentPage],
        (oldData: any) => {
          if (oldData && oldData.contractors) {
            return {
              ...oldData,
              contractors: oldData.contractors.map((contractor: any) =>
                contractor.id === variables.contractorId
                  ? {
                      ...contractor,
                      status: variables.status,
                      reviewedAt: new Date().toISOString(),
                    }
                  : contractor
              ),
            };
          }
          return oldData;
        }
      );

      // Also update the stats if available
      queryClient.setQueryData(
        ["contractors", statusFilter, currentPage],
        (oldData: any) => {
          if (oldData && oldData.stats) {
            const updatedStats = { ...oldData.stats };
            // Update the stats based on the status change
            const contractor = oldData.contractors.find(
              (c: any) => c.id === variables.contractorId
            );
            if (contractor) {
              // Decrease from old status
              if (contractor.status === "PENDING")
                updatedStats.pending = Math.max(0, updatedStats.pending - 1);
              if (contractor.status === "APPROVED")
                updatedStats.approved = Math.max(0, updatedStats.approved - 1);
              if (contractor.status === "REJECTED")
                updatedStats.rejected = Math.max(0, updatedStats.rejected - 1);

              // Increase for new status
              if (variables.status === "PENDING")
                updatedStats.pending = (updatedStats.pending || 0) + 1;
              if (variables.status === "APPROVED")
                updatedStats.approved = (updatedStats.approved || 0) + 1;
              if (variables.status === "REJECTED")
                updatedStats.rejected = (updatedStats.rejected || 0) + 1;
            }

            return {
              ...oldData,
              stats: updatedStats,
            };
          }
          return oldData;
        }
      );

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries(["contractors"]);

      toast({
        title: "تم التحديث بنجاح",
        description: data.message,
      });
      setIsReviewDialogOpen(false);
      setSelectedContractor(null);
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
    contractor: ContractorProfile,
    action: "APPROVED" | "REJECTED" | "SUSPENDED"
  ) => {
    setSelectedContractor(contractor);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };
  const handleConfirmReview = () => {
    if (!selectedContractor || !reviewAction) return;

    updateStatusMutation.mutate({
      contractorId: selectedContractor.id,
      status: reviewAction,
    });
  };

  const handleDownloadCV = (cvUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = fileName || "CV.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <Loading className="h-[400px]" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-red-500">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const contractors = data?.data || [];
  const pagination = data?.pagination;
  return (
    <div className="min-h-screen bg-[#F4F4F0] p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#6F7354]">إدارة المُنسق</h1>
          <p className="text-[#3D402C]/70">
            مراجعة والموافقة على طلبات تسجيل المُنسق
          </p>
        </div>
      </div>{" "}
      {/* Filters */}
      <Card className="bg-gradient-to-r from-white to-[#F0E0D9]/20 backdrop-blur-sm border-[#F0E0D9] shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Filter Icon and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#6F7354] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#3D402C]">
                  تصفية النتائج
                </h3>
                <p className="text-sm text-[#3D402C]/60">
                  اختر حالة الطلبات المراد عرضها
                </p>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="status-filter"
                  className="text-[#3D402C] font-medium whitespace-nowrap"
                >
                  حالة الطلب:
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-56 h-11 border-2 border-[#F0E0D9] hover:border-[#6F7354]/50 focus:border-[#6F7354] bg-white/80 backdrop-blur-sm transition-all duration-200 rounded-lg shadow-sm">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent className="border-[#F0E0D9] bg-white/95 backdrop-blur-sm">
                    <SelectItem value="ALL" className="hover:bg-[#F0E0D9]/30">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        جميع الطلبات
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="PENDING"
                      className="hover:bg-[#F0E0D9]/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#BEB4DA] rounded-full"></div>
                        في انتظار المراجعة
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="APPROVED"
                      className="hover:bg-[#F0E0D9]/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        مقبول
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="REJECTED"
                      className="hover:bg-[#F0E0D9]/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        مرفوض
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="SUSPENDED"
                      className="hover:bg-[#F0E0D9]/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        معلق
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filter Indicator */}
              {statusFilter !== "ALL" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#6F7354]/10 border border-[#6F7354]/20 rounded-lg">
                  <span className="text-sm text-[#6F7354] font-medium">
                    المرشح النشط:{" "}
                    {statusLabels[statusFilter as ContractorStatus] ||
                      "جميع الطلبات"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter("ALL")}
                    className="h-6 w-6 p-0 hover:bg-[#6F7354]/20 text-[#6F7354]"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#3D402C]">
              إجمالي الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#6F7354]">
              {pagination?.totalContractors || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#3D402C]">
              في انتظار المراجعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {" "}
            <div className="text-2xl font-bold text-[#BEB4DA]">
              {data?.stats?.pending || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#3D402C]">
              مقبول
            </CardTitle>
          </CardHeader>
          <CardContent>
            {" "}
            <div className="text-2xl font-bold text-green-600">
              {data?.stats?.approved || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#3D402C]">
              مرفوض
            </CardTitle>
          </CardHeader>
          <CardContent>
            {" "}
            <div className="text-2xl font-bold text-red-600">
              {data?.stats?.rejected || 0}
            </div>{" "}
          </CardContent>
        </Card>
      </div>
      {/* Contractors Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-[#F0E0D9] shadow-lg">
        <CardContent className="p-0">
          {contractors.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-16 w-16 text-[#6F7354]/50 mb-4" />
              <p className="text-[#3D402C]/70 text-lg">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#6F7354]/10">
                  <TableRow>
                    <TableHead className="text-[#3D402C] font-bold text-center">
                      الاسم
                    </TableHead>
                    <TableHead className="text-[#3D402C] font-bold text-center">
                      البريد الإلكتروني
                    </TableHead>
                    <TableHead className="text-[#3D402C] font-bold text-center">
                      التخصص
                    </TableHead>
                    <TableHead className="text-[#3D402C] font-bold text-center">
                      الخبرة
                    </TableHead>
                    <TableHead className="text-[#3D402C] font-bold text-center">
                      تاريخ التقديم
                    </TableHead>
                    <TableHead className="text-[#3D402C] font-bold text-center">
                      الحالة
                    </TableHead>
                    <TableHead className="text-[#3D402C] font-bold text-center">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractors.map((contractor: ContractorProfile) => (
                    <TableRow
                      key={contractor.id}
                      className="hover:bg-[#F0E0D9]/20"
                    >
                      {" "}
                      <TableCell className="font-medium text-center">
                        <div
                          className="flex items-center justify-center gap-2 cursor-pointer hover:text-[#6F7354]"
                          onClick={() => setSelectedContractor(contractor)}
                        >
                          <div className="w-8 h-8 bg-[#6F7354]/20 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-[#6F7354]" />
                          </div>
                          <span>{contractor.user.name || "غير محدد"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className="cursor-pointer hover:text-[#6F7354] hover:underline"
                          onClick={() => setSelectedContractor(contractor)}
                        >
                          {contractor.user.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {contractor.specialization || "غير محدد"}
                      </TableCell>
                      <TableCell className="text-center">
                        {contractor.experience || "غير محدد"}
                      </TableCell>
                      <TableCell className="text-center">
                        {format(new Date(contractor.createdAt), "dd/MM/yyyy", {
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariants[contractor.status]}>
                          {statusLabels[contractor.status]}
                        </Badge>
                      </TableCell>{" "}
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/contractors/${contractor.id}`)
                            }
                            className="bg-[#6F7354] text-white hover:bg-[#5F6348] text-xs"
                          >
                            <ExternalLink className="h-3 w-3 ml-1" />
                            التفاصيل
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagenation
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            searchTotalPages={pagination.totalPages}
          />
        </div>
      )}{" "}
      {/* Contractor Detail Dialog - Added for quick view */}
      {selectedContractor && (
        <Dialog
          open={!!selectedContractor && !isReviewDialogOpen}
          onOpenChange={(open) => !open && setSelectedContractor(null)}
        >
          <DialogContent
            className="max-w-2xl max-h-[80vh] overflow-y-auto"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-[#3D402C]">
                تفاصيل طلب المُنسق
              </DialogTitle>
              <DialogDescription className="text-[#3D402C]/70">
                {selectedContractor.user.name} - {selectedContractor.user.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#6F7354]">
                    الاسم
                  </Label>
                  <p className="text-sm text-[#3D402C] bg-[#F0E0D9]/30 p-2 rounded">
                    {selectedContractor.user.name || "غير محدد"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#6F7354]">
                    البريد الإلكتروني
                  </Label>
                  <p className="text-sm text-[#3D402C] bg-[#F0E0D9]/30 p-2 rounded">
                    {selectedContractor.user.email}
                  </p>
                </div>
              </div>

              {/* Professional Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-[#6F7354]">
                    النبذة الشخصية
                  </Label>
                  <p className="text-sm text-[#3D402C] bg-[#F0E0D9]/30 p-3 rounded-md mt-2">
                    {selectedContractor.bio || "لم يتم تقديم نبذة"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#6F7354]">
                      التخصص
                    </Label>
                    <p className="text-sm text-[#3D402C] bg-[#F0E0D9]/30 p-2 rounded">
                      {selectedContractor.specialization || "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#6F7354]">
                      سنوات الخبرة
                    </Label>
                    <p className="text-sm text-[#3D402C] bg-[#F0E0D9]/30 p-2 rounded">
                      {selectedContractor.experience || "غير محدد"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[#6F7354]">
                  الروابط المهنية
                </Label>
                <div className="space-y-2">
                  {selectedContractor.linkedinUrl ? (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <LinkIcon className="h-4 w-4 text-blue-600" />
                      <a
                        href={selectedContractor.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-[#3D402C]/50 p-2 bg-gray-50 rounded">
                      لا يوجد رابط LinkedIn
                    </p>
                  )}

                  {selectedContractor.portfolioUrl ? (
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                      <LinkIcon className="h-4 w-4 text-purple-600" />
                      <a
                        href={selectedContractor.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline text-sm"
                      >
                        الموقع الشخصي
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-[#3D402C]/50 p-2 bg-gray-50 rounded">
                      لا يوجد موقع شخصي
                    </p>
                  )}
                </div>
              </div>

              {/* CV */}
              {selectedContractor.cvUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#6F7354]">
                    السيرة الذاتية
                  </Label>
                  <div className="flex items-center gap-3 p-3 bg-[#6F7354]/10 rounded-lg border border-[#6F7354]/20">
                    <Download className="h-5 w-5 text-[#6F7354]" />
                    <span className="text-sm text-[#3D402C]">
                      ملف PDF - السيرة الذاتية
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownloadCV(selectedContractor.cvUrl!, "CV.pdf")
                      }
                      className="mr-auto border-[#6F7354] text-[#6F7354] hover:bg-[#6F7354] hover:text-white"
                    >
                      <Download className="h-4 w-4 ml-1" />
                      تحميل
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="default"
                onClick={() =>
                  router.push(`/admin/contractors/${selectedContractor.id}`)
                }
                className="bg-[#6F7354] text-white hover:bg-[#5F6348]"
              >
                <ExternalLink className="h-4 w-4 ml-2" />
                عرض التفاصيل الكاملة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "APPROVED" && "الموافقة على طلب المُنسق"}
              {reviewAction === "REJECTED" && "رفض طلب المُنسق"}
              {reviewAction === "SUSPENDED" && "تعليق حساب المُنسق"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "APPROVED" &&
                "سيتم ترقية المستخدم إلى مُنسق وسيتمكن من الوصول لميزات المُنسق"}
              {reviewAction === "REJECTED" && "سيتم رفض الطلب وإشعار المستخدم"}
              {reviewAction === "SUSPENDED" &&
                "سيتم تعليق حساب المُنسق مؤقتاً"}{" "}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-2">
              <p>هل أنت متأكد من تغيير حالة المُنسق؟</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmReview}
              disabled={updateStatusMutation.isLoading}
              className={
                reviewAction === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : reviewAction === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {updateStatusMutation.isLoading ? "جاري المعالجة..." : "تأكيد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
