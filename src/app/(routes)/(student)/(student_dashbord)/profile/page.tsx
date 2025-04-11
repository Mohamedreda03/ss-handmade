"use client";

import Loading from "@/components/Loading";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import axios from "axios";
import { useQuery } from "react-query";

// export const dynamic = "force-dynamic";
export default function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const data = await axios
        .get("/api/auth_user_data")
        .then((res) => res.data);

      return data.user;
    },
  });

  if (isLoading) {
    return <Loading className="h-[70vh]" />;
  }

  return (
    <div className="p-5 md:p-7">
      <div>
        <Table dir="rtl" className="mb-8 border">
          <TableBody>
            <TableRow>
              <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                ID
              </TableCell>
              <TableCell className="font-medium">{data?.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                أسم المستخدم
              </TableCell>
              <TableCell className="font-medium">{data?.name}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                البريد الالكتروني
              </TableCell>
              <TableCell className="font-medium">
                {data?.email || "لا يوجد"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                الجنس
              </TableCell>
              <TableCell className="font-medium">
                {data?.gender === "female" ? "أنثي" : "ذكر"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                المحافظة
              </TableCell>
              <TableCell className="font-medium">{data?.governorate}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-[200px] bg-slate-100 dark:bg-slate-900">
                المحفظه
              </TableCell>
              <TableCell className="font-medium">
                {data?.owned_money} جنيه
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
