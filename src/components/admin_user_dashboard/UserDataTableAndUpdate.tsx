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
    <div>
      <Button className="mb-5" variant="outline" asChild>
        <Link href="/admin/users" className="flex items-center">
          <ArrowRight className="ml-2" size={16} />
          العودة للقائمة
        </Link>
      </Button>
      <div className="text-2xl flex items-center gap-5 mb-8">
        <div>بيانات المستخدم</div>
        <div className="mr-3 border-b border-secondary">
          {data && data?.user?.name}
        </div>
      </div>
      {data && (
        <div>
          <Table dir="rtl" className="mb-8 border">
            <TableBody>
              <TableRow>
                <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                  ID
                </TableCell>
                <TableCell className="font-medium">{data?.user?.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                  أسم المستخدم
                </TableCell>
                <TableCell className="font-medium">
                  {data?.user?.name}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                  البريد الالكتروني
                </TableCell>
                <TableCell className="font-medium">
                  {data?.user?.email || "لا يوجد"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                  الصلاحيات
                </TableCell>
                <TableCell className="font-medium">
                  {data?.user?.role}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                  المال المملوك
                </TableCell>
                <TableCell className="font-medium">
                  {data?.user?.owned_money}
                  <span className="mr-2">جنية</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
      <UpdateUser user={data && (data?.user as User)} />
    </div>
  );
}
