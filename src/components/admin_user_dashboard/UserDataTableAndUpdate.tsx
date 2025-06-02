"use client";

import UpdateUser from "@/components/admin_dashboard/user/UpdateUser";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { User } from "@prisma/client";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "react-query";

export default function UserDataTableAndUpdate({ userId }: { userId: string }) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const res = await axios
        .get(`/api/admin_user/${userId}`)
        .then((res) => res.data);

      return res;
    },
  });

  if (isLoading) {
    return <Loading className="h-[300px]" />;
  }

  if (!data?.isUserAdmin) {
    router.push("/");
    return;
  }
  return (
    <div className="space-y-6">
      <Button className="mb-5" variant="outline" asChild>
        <Link href="/admin/users" className="flex items-center">
          <ArrowRight className="ml-2" size={16} />
          العودة للقائمة
        </Link>
      </Button>

      <div className="bg-card rounded-lg border p-6">
        <div className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
          <div>بيانات المستخدم</div>
          <div className="text-lg font-normal text-muted-foreground border-r pr-3">
            {data && data?.user?.name}
          </div>
        </div>

        {data && (
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <Table
              dir="rtl"
              className="bg-background rounded-lg overflow-hidden"
            >
              <TableBody>
                <TableRow>
                  <TableCell className="w-[200px] bg-primary/5 font-medium">
                    ID
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {data?.user?.id}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-[200px] bg-primary/5 font-medium">
                    اسم المستخدم
                  </TableCell>
                  <TableCell className="font-medium">
                    {data?.user?.name}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-[200px] bg-primary/5 font-medium">
                    البريد الإلكتروني
                  </TableCell>
                  <TableCell className="font-medium">
                    {data?.user?.email || "لا يوجد"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-[200px] bg-primary/5 font-medium">
                    الصلاحيات
                  </TableCell>
                  <TableCell className="font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        data?.user?.role === "ADMIN"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : data?.user?.role === "CONSTRUCTOR"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {data?.user?.role === "ADMIN"
                        ? "مدير"
                        : data?.user?.role === "CONSTRUCTOR"
                        ? "مدرب"
                        : "طالب"}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <UpdateUser user={data && (data?.user as User)} />
    </div>
  );
}
