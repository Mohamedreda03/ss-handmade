"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Years } from "@/utils/years_data";

import { User } from "@prisma/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import React, { useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Search,
  Mail,
  User as UserIcon,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "react-query";
import Link from "next/link";
import Loading from "../Loading";
import Pagenation from "../Pagenation";
import { Badge } from "../ui/badge";
import DeleteUserButton from "./DeleteUserButton";
import { toast } from "@/hooks/use-toast";
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

interface UsersTableProps {
  currentUserId: string;
}

export default function UsersTable({ currentUserId }: UsersTableProps) {
  const pageSize = 15;
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"name" | "email">("name");
  const [userFilter, setUserFilter] = useState<
    "ALL" | "STUDENT" | "CONSTRUCTOR" | "ADMIN"
  >("ALL");
  const [searchBtn, setSearchBtn] = useState<string>("1");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["users", currentPage, searchBtn, userFilter],
    queryFn: async () => {
      const res = await axios.get(
        `/api/users/search?query=${searchQuery}&type=${searchType}&page=${currentPage}&pageSize=${pageSize}&filter=${userFilter}`
      );

      setCurrentPage(res.data.meta.currentPage);
      setSearchTotalPages(res.data.meta.totalPages);

      return res.data;
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchBtn(Math.random().toString());
  };
  const handleSearchTypeToggle = () => {
    setSearchType(searchType === "name" ? "email" : "name");
    setSearchQuery("");
  };

  const handleSelectUser = (userId: string) => {
    if (userId === currentUserId) return; // منع تحديد المشرف الحالي

    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (!data?.data) return;

    const selectableUsers = data.data.filter(
      (user: User) => user.id !== currentUserId
    );

    if (selectedUsers.length === selectableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(selectableUsers.map((user: User) => user.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    setIsDeleting(true);
    try {
      const deletePromises = selectedUsers.map((userId) =>
        axios.delete(`/api/users/${userId}`)
      );

      await Promise.all(deletePromises);

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف ${selectedUsers.length} مستخدم بنجاح`,
        variant: "default",
      });

      setSelectedUsers([]);
      queryClient.invalidateQueries(["users"]);
    } catch (error: any) {
      console.error("Error in bulk delete:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف بعض المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div>
      {" "}
      <div className="mb-6">
        {/* Filter Section */}
        <div className="mb-4">
          <div
            className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border"
            dir="rtl"
          >
            <span className="text-sm font-medium text-gray-700 ml-3">
              فلترة المستخدمين:
            </span>
            <div className="flex gap-2">
              {" "}
              {[
                { value: "ALL", label: "جميع المستخدمين" },
                { value: "STUDENT", label: "الطلاب" },
                { value: "CONSTRUCTOR", label: "المدربين" },
                { value: "ADMIN", label: "المديرين" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setUserFilter(filter.value as any);
                    setCurrentPage(1);
                    setSearchBtn(Math.random().toString());
                  }}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-all duration-200",
                    userFilter === filter.value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border"
                  )}
                  disabled={dataLoading}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch}>
          {/* Search Section Container - Full Width with Right Alignment */}
          <div className="w-full">
            {/* Search Controls - Right Aligned with Background */}
            <div className="flex items-center mb-4" dir="rtl">
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                {/* Simple Switch - Two Buttons */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("name");
                      setSearchQuery("");
                    }}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      searchType === "name"
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    )}
                    disabled={dataLoading}
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>الاسم</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("email");
                      setSearchQuery("");
                    }}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      searchType === "email"
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    )}
                    disabled={dataLoading}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>ايميل</span>
                    </div>
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Input
                    placeholder={
                      searchType === "name"
                        ? "ابحث باسم المستخدم..."
                        : "ابحث بالبريد الإلكتروني..."
                    }
                    className="w-80 pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={dataLoading}
                  />
                  {searchType === "name" ? (
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Search Button */}
                <Button
                  disabled={dataLoading}
                  className="flex items-center gap-2"
                >
                  {dataLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search size={16} />
                  )}
                  <span>بحث</span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      {dataLoading ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">جاري البحث...</span>
        </div>
      ) : (
        <>
          {" "}
          {/* Results Info and Bulk Actions */}
          {data?.data && data.data.length > 0 && (
            <div className="mb-4 flex justify-between items-center" dir="rtl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <span>تم العثور على {data.meta.totalUsers} نتيجة</span>
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      تم تحديد {selectedUsers.length} مستخدم
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting}
                          className="flex items-center gap-2"
                        >
                          {isDeleting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {isDeleting ? "جاري الحذف..." : "حذف المحدد"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-right">
                            تأكيد الحذف الجماعي
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-right">
                            هل أنت متأكد من أنك تريد حذف {selectedUsers.length}{" "}
                            مستخدم محدد؟
                            <br />
                            <span className="text-red-600 font-medium">
                              ⚠️ هذا الإجراء لا يمكن التراجع عنه
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                          >
                            {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                البحث في:{" "}
                <span className="font-medium">
                  {searchType === "name"
                    ? "الاسماء"
                    : "عناوين البريد الإلكتروني"}
                </span>
              </div>
            </div>
          )}
          <Table
            dir="rtl"
            className="mb-8 border shadow-sm rounded-lg overflow-hidden"
          >
            {" "}
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-12">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleSelectAll}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      disabled={!data?.data || data.data.length === 0}
                    >
                      {data?.data &&
                      selectedUsers.length ===
                        data.data.filter(
                          (user: User) => user.id !== currentUserId
                        ).length &&
                      data.data.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>اسم المستخدم</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>البريد الالكتروني</span>
                  </div>{" "}
                </TableHead>
                <TableHead className="text-center">الصلاحيه</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>{" "}
            {data?.data.length === 0 && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-lg py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-gray-100 rounded-full">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">
                          لا يوجد نتائج للبحث
                        </p>
                        <p className="text-sm text-muted-foreground">
                          لم يتم العثور على أي{" "}
                          {searchType === "name"
                            ? "مستخدم بهذا الاسم"
                            : "مستخدم بهذا البريد الإلكتروني"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchBtn(Math.random().toString());
                        }}
                      >
                        مسح البحث
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}{" "}
            <TableBody>
              {data &&
                data?.data.map((user: User) => {
                  return (
                    <TableRow
                      key={user?.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          {user.id !== currentUserId ? (
                            <button
                              onClick={() => handleSelectUser(user.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {selectedUsers.includes(user.id) ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          ) : (
                            <div className="w-6 h-6 flex items-center justify-center">
                              <div className="w-4 h-4 bg-gray-200 rounded border-2"></div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{user?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm">
                            {user?.email || "لا يوجد"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            user?.role === "STUDENT"
                              ? "secondary"
                              : user?.role === "ADMIN"
                              ? "destructive"
                              : "default"
                          }
                          className="font-medium"
                        >
                          {user?.role === "STUDENT"
                            ? "طالب"
                            : user?.role === "ADMIN"
                            ? "مدير"
                            : "مدرب"}{" "}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            asChild
                            size="sm"
                            className="shadow-sm hover:shadow-md transition-all"
                          >
                            <Link href={`/admin/users/${user?.id}`}>
                              <span>عرض التفاصيل</span>
                            </Link>
                          </Button>

                          <DeleteUserButton
                            userId={user.id}
                            userName={user.name || "مستخدم غير معروف"}
                            userRole={user.role}
                            currentUserId={currentUserId}
                          />
                        </div>
                      </TableCell>{" "}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </>
      )}
      {searchTotalPages > 1 && (
        <Pagenation
          currentPage={currentPage}
          searchTotalPages={searchTotalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}
